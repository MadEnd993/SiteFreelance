package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/smtp"
	"os"
	"time"

	"github.com/go-chi/chi"
	"github.com/go-chi/chi/middleware"
	"github.com/go-chi/cors"
	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/joho/godotenv"
)

type BookingData struct {
	ID        int       `json:"id"`
	Name      string    `json:"name"`
	Phone     string    `json:"phone"`
	Checkin   string    `json:"checkin"`
	Checkout  string    `json:"checkout"`
	Guests    string    `json:"guests"`
	RoomType  string    `json:"roomType"`
	Message   string    `json:"message"`
	Messenger string    `json:"messenger"`
	CreatedAt time.Time `json:"createdAt"`
}

func initDB() {
	if err := godotenv.Load("../env/data.env"); err != nil {
		log.Println("ОШИБКА загрузки env: ", err)
	}

	var err error
	dbpool, err = pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatalf("Произошла ошибкаЖ: %v\n", err)
	}
}

func delete(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	_, err := dbpool.Exec(r.Context(), "DELETE FROM booking WHERE id = $1", id)
	if err != nil {
		log.Println("Ошибка удаления заявки!")
		http.Error(w, "Ошибка на стороне БД", http.StatusInternalServerError)
		return
	}

	w.WriteHeader(http.StatusOK)
}

func sendPostMail(w http.ResponseWriter, r *http.Request) {
	var data BookingData
	defer r.Body.Close()
	if err := json.NewDecoder(r.Body).Decode(&data); err != nil || data.Name == "" ||
		data.Checkout == "" || data.Guests == "" || data.Phone == "" || data.RoomType == "" || data.Checkin == "" {
		http.Error(w, "Введенные данные не корректны", http.StatusBadRequest)
		return
	}

	host := os.Getenv("HOST_NAME")
	password := os.Getenv("PASSWORD")
	email := os.Getenv("EMAIL")
	semail := os.Getenv("SEMAIL")

	auth := smtp.PlainAuth("", email, password, host)
	msg := fmt.Sprintf("Subject: Заявка\nContent-Type:text/plain;charset=UTF-8\n\nИмя: %s\nПериод: с %s по %s\nКоличество человек: %s\nНомер телефона: %s\nМессенджер для связи: %s\nТип жил.номера: %s\nДоп.Сообщение: %s", data.Name, data.Checkin, data.Checkout, data.Guests, data.Phone, data.Messenger, data.RoomType, data.Message)

	_, err := dbpool.Exec(ctx, "INSERT INTO booking(name, phone, checkin, checkout, guests, roomtype, message, messenger) VALUES($1, $2, $3, $4, $5, $6, $7, $8)", data.Name, data.Phone, data.Checkin, data.Checkout, data.Guests, data.RoomType, data.Message, data.Messenger)
	if err != nil {
		log.Println("Ошибка сохранения в БД: ", err)
		http.Error(w, "Не удалось сохранить заявку, повторите попытку позже", http.StatusInternalServerError)
		return
	}

	log.Printf("заявка сохранена")

	if err := smtp.SendMail(host+":587", auth, email, []string{semail}, []byte(msg)); err != nil {
		log.Println("Ошибка отправки письма (заявка уже сохранена в БД): ", err)
	}

	w.WriteHeader(http.StatusOK)

}

func readGet(w http.ResponseWriter, r *http.Request) {
	defer r.Body.Close()
	rows, err := dbpool.Query(ctx, "SELECT id, name, phone, checkin::text, checkout::text, guests, roomtype, message, messenger, create_at FROM booking ORDER BY create_at DESC")
	if err != nil {
		log.Println(err)
		http.Error(w, "Не удалось получить список заявок, повторите попытку позже", http.StatusInternalServerError)
		return
	}
	defer rows.Close()

	var data []BookingData
	for rows.Next() {
		var d BookingData
		err := rows.Scan(&d.ID, &d.Name, &d.Phone, &d.Checkin, &d.Checkout, &d.Guests, &d.RoomType, &d.Message, &d.Messenger, &d.CreatedAt)
		if err != nil {
			log.Println("Ошибка гет", err)
			http.Error(w, "Ошибка чтения данных", http.StatusInternalServerError)
			return
		}
		data = append(data, d)
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(data)

}

var dbpool *pgxpool.Pool
var ctx = context.Background()

func main() {
	router := chi.NewRouter()
	origin := os.Getenv("DOMEN")

	router.Use(middleware.Logger)
	router.Use(middleware.Recoverer)
	router.Use(cors.Handler(cors.Options{
		AllowedOrigins:   []string{origin},
		AllowedMethods:   []string{"GET", "OPTIONS", "POST", "DELETE"},
		AllowedHeaders:   []string{"Content-Type"},
		AllowCredentials: false,
		MaxAge:           300,
	}))

	initDB()
	defer dbpool.Close()

	router.Get("/api/bookings", readGet)
	router.Post("/api/booking", sendPostMail)
	router.Delete("/api/bookings/{id}", delete)

	http.ListenAndServe(":8080", router)

}
