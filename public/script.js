var db = firebase.database();                 // firebase database

var total = 0;

$(document).ready(main());


function main(){

    reset();

    $("body").on("click", ".money-button", function(){

        var index = $(".money-button").index(this);
        var value = Number($(".money-button").eq(index).val());
        total += value;

        $("#total").text(total);

    });

    $("body").on("click", "#reset", function(){

        total = 0;
        $("#total").text(total);

    })


    $("body").on("click", "#save-spending", function(){

        increaseLifetimeTotal(total);

    })

    $("body").on("keyup", "#total", function(){

        var newVal = Number($("#total").text());
        console.log(newVal);

        total = newVal;

    })

}


function reset(){
    total = 0;
    $("#total").text(total);
    $("#expenses-history").find(".container").empty();

    getTotalSpending();
    getSpendingHistory();
}




/* FIREBASE FUNCTIONS */

function increaseLifetimeTotal(thisAmount){

    var purchase = db.ref("purchases").push();                  // create a new child
    
    purchase.set({                                              // give that child a value
        amount: Math.round(thisAmount*100)/100,  
        date: Date()
    });
    
    reset();

}

function getTotalSpending(){

     db.ref("purchases").once('value').then(function(snapshot) {

        var total = 0;

        for (key in snapshot.val()){
            total += snapshot.val()[key].amount;
        }

        total = total.toFixed(2);

        $("#lifetime-total").text(total);

    })


}

function getSpendingHistory(){
    db.ref("purchases").once('value').then(function(snapshot) {

        var purchases = [];

        for (key in snapshot.val()){
            purchases.push(snapshot.val()[key]);
        }

        var nowMonth = new Date().getMonth();
        var nowYear = new Date().getYear();

        for(var i = 1; i < 31; i++){            // 31 - change to last date of month

            var nowDay = i;
            var spentOnThisDay = 0;
            var daysOfWeek = ["Sun", "Mon", "Tue", "Wed", "Thur", "Fri", "Sat"];
            var date = new Date().setDate(i);
            var dayOfWeek  = daysOfWeek[new Date(date).getDay()];

            for(var j = 0; j < purchases.length; j++){
                var thisDate = new Date(purchases[j].date);

                var thisPurchaseDay = thisDate.getDate();
                var thisPurchaseMonth = thisDate.getMonth();
                var thisPurchaseYear = thisDate.getYear();

                if(thisPurchaseDay == nowDay && thisPurchaseMonth == nowMonth && thisPurchaseYear == nowYear){
                    spentOnThisDay +=  purchases[j].amount;
                    // purchases.splice(j, 1);
                }
            }

            spentOnThisDay = Math.round(spentOnThisDay*100)/100;

            var thisId = nowMonth.toString() + nowDay.toString() + nowYear.toString();



            if(spentOnThisDay > 0 ||  i <=  new Date().getDate()){
                $("#expenses-history").find(".container").append("<div class = 'historical-spending-section'><div class = 'one-day'><span class = 'date'><span class = 'day-of-week'>" + dayOfWeek + "</span><br>" + nowDay + "</span><span class = 'amount'>$" + (spentOnThisDay) + "</span><span class = 'amount-bar' id = "+ thisId + "></div></div>");
            }
            

            spentOnThisDay *= 2;

            if(spentOnThisDay > 240){ 
                spentOnThisDay = 240; 
                $("#" + thisId).css("background", "#ed4630");
            }

            $("#" + thisId).css("width", (spentOnThisDay));


        }






    });
}

