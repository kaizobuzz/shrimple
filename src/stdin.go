package src

import (
	"fmt"
	"log"
)
func takeStdIn(){
    for{
        var message_type string
        var arg string
        _, err:=fmt.Scan(&message_type, &arg)
        if err!=nil{
            log.Println(err) 
            continue;
        }
        fmt.Println(message_type, arg)
    }
}
