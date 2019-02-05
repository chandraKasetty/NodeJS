module.exports = {
    GroupBy: function (xs, key) {
      return  GroupBy(xs, key) 
    },
    GetDayFromDate: function (date){
       return GetDayFromDate(date);
    }    
}

var GroupBy= function(xs, key) {
    return xs.reduce(function (rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});
};

var GetDayFromDate =function (date) {
    var day;
    switch (new Date(date).getDay()) {
        case 0:
            day = "Sunday";
            break;
        case 1:
            day = "Monday";
            break;
        case 2:
            day = "Tuesday";
            break;
        case 3:
            day = "Wednesday";
            break;
        case 4:
            day = "Thursday";
            break;
        case 5:
            day = "Friday";
            break;
        case 6:
            day = "Saturday";
    }
    return day;
}