package shared

type rem struct{

}
func (r *rem) Error() string{
    return "too nilrem[1]"
}
func GetNilrem()*rem{
    var nilrem *rem=nil
    return nilrem
}
