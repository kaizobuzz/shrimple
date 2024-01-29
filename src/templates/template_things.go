package templates

import (
	"context"
	"net/http"

	"github.com/a-h/templ"
)

type string_template func(string) templ.Component 

func UseStringTemplate(message string, template string_template, w *http.ResponseWriter) error{
   return template(message).Render(context.Background(), *w) 
}

