package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
    "github.com/gorilla/websocket"
    "log"
    "errors"
    "context"
	"github.com/joho/godotenv"
	"fmt"
	"os"
	openai "github.com/sashabaranov/go-openai"

)
var upgrader = websocket.Upgrader{}

type Message struct {
    Message string `json:"message"`
 }


func goDotEnvVariable(key string) string {
	err := godotenv.Load(".env")
  
	if err != nil {
	  log.Fatalf("Error loading .env file")
	}
  
	return os.Getenv(key)
  }

func main() {
	openai_key := os.Getenv("OPEN_AI_KEY")
    client := openai.NewClient(openai_key)

	e := echo.New()
	e.Use(middleware.Static("./build"))
	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	port := goDotEnvVariable("PORT")

	if port == "" {
		port = "8080"
	}

	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})

	e.GET("/ws", func(c echo.Context) error {
		upgrader.CheckOrigin = func(r *http.Request) bool { return true }

		ws, err := upgrader.Upgrade(c.Response().Writer, c.Request(), nil)
		if !errors.Is(err, nil) {
			log.Println(err)
		}
		// defer ws.Close()

		for {
			var message Message
			err := ws.ReadJSON(&message)

			if !errors.Is(err, nil) {
				log.Printf("error occurred: %v", err)
				break
			}
			log.Println(message)

            resp, err := client.CreateChatCompletion(
                context.Background(),
                openai.ChatCompletionRequest{
                    Model: openai.GPT3Dot5Turbo,
                    Messages: []openai.ChatCompletionMessage{
                        {
                            Role:    openai.ChatMessageRoleUser,
                            Content: message.Message,
                        },
                    },
                },
            )
            
            if err != nil {
                fmt.Printf("ChatCompletion error: %v\n", err)
            }
        
            // fmt.Println(resp.Choices[0].Message.Content)
    
			if err := ws.WriteJSON(resp.Choices[0].Message.Content); !errors.Is(err, nil) {
				log.Printf("error occurred: %v", err)
			}
		}

		return nil
	})
	e.Logger.Fatal(e.Start(":"+port))
}