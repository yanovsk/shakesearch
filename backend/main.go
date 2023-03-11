package main

import (
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"net/http"
    "github.com/gorilla/websocket"
    "log"
    "errors"
    "context"
	"fmt"
	openai "github.com/sashabaranov/go-openai"

)
var upgrader = websocket.Upgrader{}

type Message struct {
    Message string `json:"message"`
 }


func main() {
    client := openai.NewClient("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")

	e := echo.New()

	e.Use(middleware.Logger())
	e.Use(middleware.Recover())

	e.GET("/", func(c echo.Context) error {
		return c.String(http.StatusOK, "Hello, World!")
	})

	e.GET("/ws", func(c echo.Context) error {
		upgrader.CheckOrigin = func(r *http.Request) bool { return true }

		ws, err := upgrader.Upgrade(c.Response().Writer, c.Request(), nil)
		if !errors.Is(err, nil) {
			log.Println(err)
		}
		defer ws.Close()

		log.Println("Connected!")

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
        
            fmt.Println(resp.Choices[0].Message.Content)
    
			if err := ws.WriteJSON(resp.Choices[0].Message.Content); !errors.Is(err, nil) {
				log.Printf("error occurred: %v", err)
			}
		}

		return nil
	})
	e.Logger.Fatal(e.Start(":8080"))
}