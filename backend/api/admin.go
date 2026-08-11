package api

import (
	"encoding/json"
	"net/http"
	"time"

	"dating-backend/db"
	"github.com/google/uuid"
	"github.com/gorilla/mux"
	"golang.org/x/crypto/bcrypt"
)

// Define the SubAdmin struct based on our DB schema
type SubAdmin struct {
	ID           string    `json:"id"`
	Username     string    `json:"username"`
	PasswordHash string    `json:"-"` // Never send hash to client
	RoleTitle    string    `json:"role_title"`
	AccessArea   string    `json:"access_area"`
	CreatedAt    time.Time `json:"created_at"`
}

type CreateSubAdminRequest struct {
	Username   string `json:"username"`
	Password   string `json:"password"`
	RoleTitle  string `json:"role_title"`
	AccessArea string `json:"access_area"`
}

type VerifySubAdminRequest struct {
	Username string `json:"username"`
	Password string `json:"password"`
}

// GetSubAdmins fetches all sub-admins from the database
func GetSubAdmins(w http.ResponseWriter, r *http.Request) {
	var subAdmins []SubAdmin
	
	// Fetch all sub-admins from Supabase (Password hashes will be included from DB but excluded from JSON due to `json:"-"`)
	_, err := db.Client.From("sub_admins").Select("*", "exact", false).ExecuteTo(&subAdmins)
	if err != nil {
		http.Error(w, "Failed to fetch sub-admins", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(subAdmins)
}

// CreateSubAdmin hashes the password and inserts a new sub-admin
func CreateSubAdmin(w http.ResponseWriter, r *http.Request) {
	var req CreateSubAdminRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	if req.Username == "" || req.Password == "" || req.RoleTitle == "" || req.AccessArea == "" {
		http.Error(w, "All fields are required", http.StatusBadRequest)
		return
	}

	// Hash password
	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		http.Error(w, "Failed to secure password", http.StatusInternalServerError)
		return
	}

	// Since we are inserting into Supabase using a struct, the fields need to match DB column names via json tags.
	type dbInsertSubAdmin struct {
		ID           string    `json:"id"`
		Username     string    `json:"username"`
		PasswordHash string    `json:"password_hash"`
		RoleTitle    string    `json:"role_title"`
		AccessArea   string    `json:"access_area"`
		CreatedAt    time.Time `json:"created_at"`
	}

	newSubAdmin := dbInsertSubAdmin{
		ID:           uuid.New().String(),
		Username:     req.Username,
		PasswordHash: string(hashedPassword),
		RoleTitle:    req.RoleTitle,
		AccessArea:   req.AccessArea,
		CreatedAt:    time.Now().UTC(),
	}

	// Insert into Supabase
	var inserted []SubAdmin
	_, err = db.Client.From("sub_admins").Insert(newSubAdmin, false, "", "representation", "exact").ExecuteTo(&inserted)
	if err != nil {
		// Log detailed error from Supabase for debugging
		http.Error(w, "Failed to create sub-admin. Ensure table 'sub_admins' exists.", http.StatusInternalServerError)
		return
	}

	if len(inserted) > 0 {
		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(inserted[0])
		return
	}

	http.Error(w, "Failed to verify creation", http.StatusInternalServerError)
}

// DeleteSubAdmin removes a sub-admin
func DeleteSubAdmin(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	id := vars["id"]

	if id == "" {
		http.Error(w, "ID is required", http.StatusBadRequest)
		return
	}

	_, _, err := db.Client.From("sub_admins").Delete("", "exact").Eq("id", id).Execute()
	if err != nil {
		http.Error(w, "Failed to delete sub-admin", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
	w.Write([]byte(`{"success": true}`))
}

// VerifySubAdmin validates a username and password
func VerifySubAdmin(w http.ResponseWriter, r *http.Request) {
	var req VerifySubAdminRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		http.Error(w, "Invalid request body", http.StatusBadRequest)
		return
	}

	type dbSubAdmin struct {
		ID           string `json:"id"`
		PasswordHash string `json:"password_hash"`
		AccessArea   string `json:"access_area"`
	}
	var results []dbSubAdmin

	_, err := db.Client.From("sub_admins").Select("id, password_hash, access_area", "exact", false).Eq("username", req.Username).ExecuteTo(&results)
	if err != nil || len(results) == 0 {
		// Run a dummy compare to prevent timing attacks
		bcrypt.CompareHashAndPassword([]byte("$2a$10$dummy......................"), []byte(req.Password))
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	target := results[0]
	err = bcrypt.CompareHashAndPassword([]byte(target.PasswordHash), []byte(req.Password))
	if err != nil {
		http.Error(w, "Invalid credentials", http.StatusUnauthorized)
		return
	}

	// Success
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"success": true,
		"role":    "sub_admin",
		"scope":   target.AccessArea,
	})
}
