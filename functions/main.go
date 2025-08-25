package main

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"

	firebase "firebase.google.com/go"
	"firebase.google.com/go/auth"
	"golang.org/x/net/context"
	"google.golang.org/api/option"
)

type Response struct {
	Status  bool        `json:"status"`
	Code    string      `json:"code"`
	Message string      `json:"message"`
	Data    interface{} `json:"data,omitempty"`
}

type LineVerifyResponse struct {
	ClientID  string `json:"client_id"`
	ExpiresIn int    `json:"expires_in"`
	Scope     string `json:"scope"`
}

var (
	lineChannelID     = "2007733529"
	lineChannelSecret = "4e3197d83a8d9836ae5794fda50b698a"
)

func sendResponse(w http.ResponseWriter, status int, code, message string, data interface{}) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(status)
	resp := Response{
		Status:  status < 400,
		Code:    code,
		Message: message,
		Data:    data,
	}
	json.NewEncoder(w).Encode(resp)
}

func handleCORS(w http.ResponseWriter, r *http.Request) bool {
	origin := r.Header.Get("Origin")
	allowedOrigins := []string{
		"http://127.0.0.1:5500",
		"http://localhost:5500",
		"https://basic-firebase-80425.web.app",
		"https://basic-firebase-80425.firebaseapp.com",
	}

	allowed := false
	for _, o := range allowedOrigins {
		if o == origin {
			allowed = true
			break
		}
	}

	if allowed {
		w.Header().Set("Access-Control-Allow-Origin", origin)
	} else {
		w.Header().Set("Access-Control-Allow-Origin", "https://basic-firebase-80425.web.app")
	}

	w.Header().Set("Access-Control-Allow-Methods", "GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
	w.Header().Set("Access-Control-Max-Age", "3600")

	if r.Method == http.MethodOptions {
		w.WriteHeader(http.StatusNoContent)
		return false
	}
	return true
}

func verifyLineLogin(app *firebase.App, authClient *auth.Client) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if !handleCORS(w, r) {
			return
		}

		ctx := context.Background()
		accessToken := r.URL.Query().Get("accessToken")
		sub := r.URL.Query().Get("sub")
		email := r.URL.Query().Get("email")

		if accessToken == "" {
			sendResponse(w, http.StatusBadRequest, "MISSING_TOKEN", "Access token is required", nil)
			return
		}

		log.Printf("🔍 Verifying LINE access token: %s...", accessToken[:20])

		// Verify token with LINE API
		resp, err := http.Get("https://api.line.me/oauth2/v2.1/verify?access_token=" + accessToken)
		if err != nil {
			sendResponse(w, http.StatusInternalServerError, "LINE_VERIFICATION_FAILED", "Failed to verify token", nil)
			return
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(resp.Body)
			log.Printf("LINE API error: %s", string(body))
			sendResponse(w, resp.StatusCode, "LINE_VERIFICATION_FAILED", "LINE token verification failed", nil)
			return
		}

		var verifyData LineVerifyResponse
		if err := json.NewDecoder(resp.Body).Decode(&verifyData); err != nil {
			sendResponse(w, http.StatusInternalServerError, "PARSE_ERROR", "Failed to parse LINE verification response", nil)
			return
		}

		if verifyData.ClientID != lineChannelID {
			sendResponse(w, http.StatusBadRequest, "INVALID_CHANNEL", "Invalid LINE channel ID", nil)
			return
		}

		// Check if user exists or create new one
		var uid string
		userRecord, err := authClient.GetUserByEmail(ctx, email)
		if err != nil {
			if strings.Contains(err.Error(), "user-not-found") {
				log.Printf("ℹ️ User with email %s not found, creating new user", email)
				uid = sub
				_, err := authClient.CreateUser(ctx, (&auth.UserToCreate{}).UID(uid).Email(email))
				if err != nil {
					sendResponse(w, http.StatusInternalServerError, "USER_CREATION_FAILED", "Failed to create user", nil)
					return
				}
			} else {
				sendResponse(w, http.StatusInternalServerError, "USER_LOOKUP_FAILED", "Failed to lookup user", nil)
				return
			}
		} else {
			uid = userRecord.UID
		}

		// Create custom token
		customToken, err := authClient.CustomToken(ctx, uid)
		if err != nil {
			sendResponse(w, http.StatusInternalServerError, "TOKEN_CREATION_FAILED", "Failed to create custom token", nil)
			return
		}

		// Exchange custom token for ID token
		exchangeURL := "https://identitytoolkit.googleapis.com/v1/accounts:signInWithCustomToken?key=" + "AIzaSyC4pMv-UMVU4hqkSV-FaEiA1Z0txFo9j0I"
		payload := fmt.Sprintf(`{"token":"%s","returnSecureToken":true}`, customToken)
		req, _ := http.NewRequest("POST", exchangeURL, strings.NewReader(payload))
		req.Header.Set("Content-Type", "application/json")

		exResp, err := http.DefaultClient.Do(req)
		if err != nil {
			sendResponse(w, http.StatusInternalServerError, "TOKEN_EXCHANGE_FAILED", "Failed to exchange token", nil)
			return
		}
		defer exResp.Body.Close()

		if exResp.StatusCode != http.StatusOK {
			body, _ := io.ReadAll(exResp.Body)
			log.Printf("Firebase token exchange error: %s", string(body))
			sendResponse(w, exResp.StatusCode, "TOKEN_EXCHANGE_FAILED", "Failed to exchange custom token", nil)
			return
		}

		var idTokenData map[string]interface{}
		if err := json.NewDecoder(exResp.Body).Decode(&idTokenData); err != nil {
			sendResponse(w, http.StatusInternalServerError, "PARSE_ERROR", "Failed to parse ID token response", nil)
			return
		}

		idToken, ok := idTokenData["idToken"].(string)
		if !ok || idToken == "" {
			sendResponse(w, http.StatusInternalServerError, "NO_ID_TOKEN", "ID token not received from Firebase", nil)
			return
		}

		sendResponse(w, http.StatusOK, "SUCCESS", "Success", map[string]string{
			"id_token": idToken,
		})
	}
}

func main() {
	ctx := context.Background()
	var app *firebase.App
	var err error

	if os.Getenv("FUNCTIONS_EMULATOR") != "" {
		opt := option.WithCredentialsFile("../serviceAccountKey.json")
		app, err = firebase.NewApp(ctx, nil, opt)
	} else {
		app, err = firebase.NewApp(ctx, nil)
	}
	if err != nil {
		log.Fatalf("error initializing app: %v", err)
	}

	authClient, err := app.Auth(ctx)
	if err != nil {
		log.Fatalf("error getting Auth client: %v", err)
	}

	http.HandleFunc("/verifyLineLogin", verifyLineLogin(app, authClient))
	log.Println("Server started on :8080")
	log.Fatal(http.ListenAndServe(":8080", nil))
}
