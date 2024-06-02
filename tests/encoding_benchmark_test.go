package tests

import (
	"shrimple/src/shared"
	"testing"
)
type User=shared.User
func BenchmarkTestFunction(b *testing.B) { 
    /*first_var:=User{
            Username: "",
            Id: "302",
            PasswordHash: shared.HashSalt{Salt: []byte("idk"), Hash: []byte("Yeah just pretend this is a real password")}, 
            Experience: 0,
            Friends: []int64{3, 5, 7, 312948721894, 2138, 4214, 13,4,1525, 14143, 156413, 1414243, 15256, 13837, 12142421, 1259879},
            IncomingFriendRequests: []int64{},
            OutgoingFriendRequests: []int64{3, 5, 8, 9, 10, 134, 115, 18, 30, 423015, 18, 30, 423015, 18, 30, 423015, 18, 30, 423015, 18, 30, 45, 18, 30, 4230,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,},
            GuessHistory: make(map[string]map[int64]int),
        } 
        first_var.GuessHistory["shrimple"]=make(map[int64]int) 
        first_var.GuessHistory["clamplicated"]=make(map[int64]int)
        for i:=0; i<100; i++{
            first_var.GuessHistory["shrimple"][int64(i+24000)]=i  
            first_var.GuessHistory["clamplicated"][int64(i+40000)]=i
        }

    for i:=0; i<b.N; i++{
                //log.Println(first_var.X, first_var.Y)
		result, err := database.EncodeGob(first_var.IncomingFriendRequests)
		if err != nil {
			b.Fatal(err)
		}
        result2, err:=database.EncodeGob(first_var.GuessHistory)
        if err != nil {
			b.Fatal(err)
		}
        result3, err:=database.EncodeGob(first_var.OutgoingFriendRequests)
        if err!=nil{
            b.Fatal(err)
        }
        //log.Printf("%s\n", string(result))
		//log.Printf("%s\n", string(result2))
        //log.Println("length", len(result), len(result2))
        //log.Println("length raw", len(fmt.Sprint(first_var.Friends, first_var.GuessHistory, first_var.IncomingFriendRequests)))
		var second_var User = User{}
		err = database.DecodeGob(result, &second_var.IncomingFriendRequests)
		if err != nil {
			log.Println("?")
			b.Fatal(err)
		}
		err = database.DecodeGob(result2, &second_var.GuessHistory)
        if err != nil {
			log.Println("?")
			b.Fatal(err)
		}
        err=database.DecodeGob(result3, &second_var.OutgoingFriendRequests)
        if err!=nil{
            b.Fatal(err)
        }
        //log.Println(second_var.OutgoingFriendRequests)
		//log.Println(second_var.X, second_var.Y, second_var.More_things, second_var.Thing)
	}*/
}
func BenchmarkJsonEncoding(b *testing.B){
/*first_var:=User{
            Username: "",
            Id: 302,
            PasswordHash: shared.HashSalt{Salt: []byte("idk"), Hash: []byte("Yeah just pretend this is a real password")}, 
            Experience: 0,
            Friends: []int64{3, 5, 7, 312948721894, 2138, 4214, 13,4,1525, 14143, 156413, 1414243, 15256, 13837, 12142421, 1259879},
            IncomingFriendRequests: []int64{},
            OutgoingFriendRequests: []int64{3, 5, 2, 5, 8, 9, 10, 134, 115, 18, 30, 423015, 18, 30, 423015, 18, 30, 423015, 18, 30, 423015, 18, 30, 45, 18, 30, 4230,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,45, 18, 30,},
            GuessHistory: make(map[string]map[int64]int),
        } 
        first_var.GuessHistory["shrimple"]=make(map[int64]int) 
        first_var.GuessHistory["clamplicated"]=make(map[int64]int)
        for i:=0; i<100; i++{
            first_var.GuessHistory["shrimple"][int64(i+24000)]=i  
            first_var.GuessHistory["clamplicated"][int64(i+40000)]=i
        }

    for i:=0; i<b.N; i++{
            result, err := json.Marshal(first_var.IncomingFriendRequests)
		if err != nil {
			b.Fatal(err)
		}
        result2, err:=json.Marshal(first_var.GuessHistory)
        if err != nil {
			b.Fatal(err)
		}
        result3, err:=json.Marshal(first_var.OutgoingFriendRequests)
        if err!=nil{
            b.Fatal(err)
        }
        var second_var User = User{}
		err = json.Unmarshal(result, &second_var.IncomingFriendRequests)
		if err != nil {
			b.Fatal(err)
		}
		err = json.Unmarshal(result2, &second_var.GuessHistory)
        if err != nil {
			b.Fatal(err)
		}
        err=json.Unmarshal(result3, &second_var.OutgoingFriendRequests)
        if err!=nil{
            b.Fatal(err)
        }
    }*/
}
