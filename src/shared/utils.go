package shared
import(
    "slices"
    "errors"
    "fmt"
    "sync"
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

type Locked[T any] struct {
    Value T 
    Lock sync.Mutex
}

func (l *Locked[T]) SafeAccessInner() T {
    l.Lock.Lock();
    return l.Value
}

func (l *Locked[T]) SafeWriteInner(val T) {
    l.Lock.Lock();
    l.Value = val
    l.Lock.Unlock();
}

func (l *Locked[T]) SafeProcessInner(x func(T)) {
    l.Lock.Lock();
    x(l.Value)
    l.Lock.Unlock();
}


