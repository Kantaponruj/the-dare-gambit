package main

import (
	"context"
	"encoding/json"
	"log"
	"net/http"
	"os"
	"strings"

	firebase "firebase.google.com/go"
	"google.golang.org/api/option"

	"the-dare-gambit-server/internal/cards"
	"the-dare-gambit-server/internal/game"
	"the-dare-gambit-server/internal/socket"

	"github.com/google/uuid"
	socketio "github.com/zishang520/socket.io/socket"
)

func main() {
	ctx := context.Background()

	// Initialize Firebase
	projectID := os.Getenv("GOOGLE_CLOUD_PROJECT")
	if projectID == "" {
		projectID = "the-dare-gambit" // Default for local dev
	}
	conf := &firebase.Config{ProjectID: projectID}
	
	var app *firebase.App
	var err error

	// If GOOGLE_APPLICATION_CREDENTIALS is set, use it (dev mode)
	if os.Getenv("GOOGLE_APPLICATION_CREDENTIALS") != "" {
		opt := option.WithCredentialsFile(os.Getenv("GOOGLE_APPLICATION_CREDENTIALS"))
		app, err = firebase.NewApp(ctx, conf, opt)
	} else {
		app, err = firebase.NewApp(ctx, conf)
	}

	if err != nil {
		log.Printf("Warning: error initializing app: %v\n", err)
	}

	client, err := app.Firestore(ctx)
	if err != nil {
		log.Printf("Warning: Could not initialize Firestore: %v", err)
	} else {
		defer client.Close()
	}

	// Initialize services
	cardService := cards.NewService(client)
	
	// Setup Socket.IO
	io := socketio.NewServer(nil, nil)
	gameManager := game.NewManager(cardService)
	gameManager.SetIO(io)
	socketHandler := socket.NewHandler(gameManager)
	socketHandler.RegisterEvents(io)

	// Setup HTTP Server
	// We need to handle CORS manually or via middleware if using a framework.
	// Since we are using raw net/http with socket.io, socket.io handles its own CORS if configured.
	// But for the http handler, we might need a wrapper.
	
	// The zishang520/socket.io library provides a handler.
	// We need to enable CORS for the socket server.
	// Note: The library might have specific CORS config.
	
	// Let's use a simple mux
	mux := http.NewServeMux()
	
	// Serve socket.io
	mux.Handle("/socket.io/", io.ServeHandler(nil))

	// Simple health check
	mux.HandleFunc("/", func(w http.ResponseWriter, r *http.Request) {
		if r.URL.Path != "/" {
			http.NotFound(w, r)
			return
		}
		w.Write([]byte("Game Show Server (Go) is running!"))
	})

	// Category Handlers
	mux.HandleFunc("/categories", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		
		switch r.Method {
		case http.MethodGet:
			json.NewEncoder(w).Encode(gameManager.GetCategories())
		
		case http.MethodPost:
			var body struct {
				Name string `json:"name"`
			}
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			if err := gameManager.AddCategory(body.Name); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(body)
			
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/categories/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		name := strings.TrimPrefix(r.URL.Path, "/categories/")
		if name == "" {
			http.Error(w, "Category name required", http.StatusBadRequest)
			return
		}
		// Decode URL encoding if necessary (browser sends encoded)
		// But strings.TrimPrefix keeps it as is.
		// Actually standard lib might not decode path automatically in all cases?
		// r.URL.Path is usually decoded? No, it's not.
		// Wait, r.URL.Path IS decoded.
		
		switch r.Method {
		case http.MethodDelete:
			if err := gameManager.DeleteCategory(name); err != nil {
				http.Error(w, err.Error(), http.StatusNotFound)
				return
			}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})

		case http.MethodPut:
			var body struct {
				NewName string `json:"newName"`
			}
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			if err := gameManager.UpdateCategory(name, body.NewName); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(body)

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Question Handlers
	mux.HandleFunc("/questions", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		
		switch r.Method {
		case http.MethodGet:
			json.NewEncoder(w).Encode(gameManager.GetQuestions())
		
		case http.MethodPost:
			var body struct {
				Text     string `json:"text"`
				Category string `json:"category"`
				Answer   string `json:"answer"`
			}
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			if err := gameManager.AddQuestion(body.Text, body.Category, body.Answer); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(body)
			
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/questions/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		id := strings.TrimPrefix(r.URL.Path, "/questions/")
		if id == "" {
			http.Error(w, "Question ID required", http.StatusBadRequest)
			return
		}
		
		switch r.Method {
		case http.MethodDelete:
			if err := gameManager.DeleteQuestion(id); err != nil {
				http.Error(w, err.Error(), http.StatusNotFound)
				return
			}
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Cards Handlers
	mux.HandleFunc("/cards", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		
		switch r.Method {
		case http.MethodGet:
			json.NewEncoder(w).Encode(cardService.GetAll())
		
		case http.MethodPost:
			var body cards.GameCard
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			if body.ID == "" {
				body.ID = uuid.NewString()
			}
			cardService.AddCard(body)
			w.WriteHeader(http.StatusCreated)
			json.NewEncoder(w).Encode(body)
			
		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	mux.HandleFunc("/cards/", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		id := strings.TrimPrefix(r.URL.Path, "/cards/")
		if id == "" {
			http.Error(w, "Card ID required", http.StatusBadRequest)
			return
		}
		
		switch r.Method {
		case http.MethodDelete:
			cardService.DeleteCard(id)
			w.WriteHeader(http.StatusOK)
			json.NewEncoder(w).Encode(map[string]string{"status": "deleted"})

		case http.MethodPut:
			var body cards.GameCard
			if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
				http.Error(w, err.Error(), http.StatusBadRequest)
				return
			}
			if cardService.UpdateCard(id, body) {
				w.WriteHeader(http.StatusOK)
				json.NewEncoder(w).Encode(body)
			} else {
				http.Error(w, "Card not found", http.StatusNotFound)
			}

		default:
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		}
	})

	// Login Handler (Mock)
	mux.HandleFunc("/login", func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		if r.Method != http.MethodPost {
			http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
			return
		}

		var body struct {
			Username string `json:"username"`
			Password string `json:"password"`
		}
		if err := json.NewDecoder(r.Body).Decode(&body); err != nil {
			http.Error(w, err.Error(), http.StatusBadRequest)
			return
		}

		// Mock authentication - accept anything for now
		if body.Username != "" {
			json.NewEncoder(w).Encode(map[string]string{
				"token": "dummy-token-" + uuid.NewString(),
			})
			return
		}
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
	})

	// CORS Middleware
	corsHandler := func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, DELETE")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			w.Header().Set("Access-Control-Allow-Credentials", "true")
			if r.Method == "OPTIONS" {
				return
			}
			h.ServeHTTP(w, r)
		})
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "3000"
	}

	log.Printf("Starting server on port %s...", port)
	if err := http.ListenAndServe(":"+port, corsHandler(mux)); err != nil {
		log.Fatalf("Server failed: %v", err)
	}
}
