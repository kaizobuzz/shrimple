package database

import (
	"bytes"
	"encoding/gob"
)

func EncodeGob(object any) ([]byte, error) {
    var gob_buffer bytes.Buffer
    encoding_stream := gob.NewEncoder(&gob_buffer)
	if err := encoding_stream.Encode(object); err != nil {
		return nil, err
	}
	return gob_buffer.Bytes(), nil
}

/*VERY IMPORTANT NOTE: if the value encoded is a 0 value, then it will not override what it is being decoded into (in this case, it will mostly be used for slices and maps which will probably be put as an empty rather than a nil one, in addition to probably initializing a new object whenever using a decoded value but just important to note)*/
func DecodeGob(data []byte, object any) error {
	decoding_stream := gob.NewDecoder(bytes.NewReader(data))
	if err := decoding_stream.Decode(object); err != nil {
		return err
	}
	return nil
}





