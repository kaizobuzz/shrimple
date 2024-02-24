package shared
import(
    "slices"
    "errors"
    "fmt"
)
func UnstableDelete[T comparable](slice []T, value T)([]T, error){
    index:=slices.Index(slice, value)
    if (index==-1){
        return slice, errors.New(fmt.Sprint("value: ", value, "not found in slice: ", slice))
    }
    return UnstableDeleteIndex(slice, index), nil
}
func UnstableDeleteIndex[T any](slice []T, index int)([]T){
    slice[index]=slice[len(slice)-1]
    return slice[:len(slice)-1]
}
