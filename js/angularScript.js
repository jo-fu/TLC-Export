var app = angular.module('tlApp', []);

app
    .controller('MainCtrl', function($scope, $http, $sce, CreateArray, CreateTimeline, DateHandling, DateExporting) {

        $scope.orderByVal = "val"
        $scope.orderReverse = false
        $scope.tlDescr = ["This is a timeline made with TimeLineCurator", "Loading data if there is some..."]
        $scope.fileNames = []
        $scope.trackNames = [
            ["1", "1"],
            ["2", "2"],
            ["3", "3"],
            ["4", "4"],
            ["5", "5"],
            ["6", "6"]
        ]

        $scope.sortBy = [{
            title: "Order inside document",
            val: "id"
        }, {
            title: "Chronology of dates",
            val: "val"
        }, {
            title: "Type of event",
            val: "typ"
        }, {
            title: "State of curation",
            val: "touched"
        }, {
            title: "Document",
            val: "document"
        }, {
            title: "Track",
            val: "trackNr"
        }]

        $scope.files = [];
        $scope.dcts = ["2015-02-15"];
        $scope.timexes = [];
        $scope.currIndex = -1;
        $scope.severalSelected = false;
        $scope.editDate = false;
        $scope.singleSents = []
        $scope.dateInfo = []
        $scope.colorDate = colorDate;

        // To allow external sources, e.g. in iFrame
        $scope.youtubelink = function(src) {
        		// We need embed link - not raw url
        		if(src.indexOf("watch?v=")>-1 && src.indexOf("embed")<0){
        			varnewsrc = src.split("watch?v=")[1]
        			src = "https://www.youtube.com/embed/"+varnewsrc
        		}
                return $sce.trustAsResourceUrl(src);
            }

        // If there is a saved session in Local Storage - load it in
        if (localStorage.getItem("savedData") === null) {
            $scope.prevData = false
        } else {
            $scope.prevData = localStorage.getItem("savedData")
        }

        // Building TL without any dates on it
        CreateTimeline.buildTl($scope)

        $scope.showDateInfo = function(txObject) {
            return CreateTimeline.showDateInfo(txObject)
        }

        $scope.makeSelection = function(sentNr, d, origin) {
            $scope = DateHandling.makeSelection($scope, sentNr, d, origin)
        }

        $scope.clickList = function(d) {
            var sentNr = d.sentNr;
            $scope.makeSelection(sentNr, d, "fromList")
        }
        $scope.clickingSent = function(s) {
            var d = $.grep($scope.timexes, function(tx) {
                return tx.sentNr == s
            });
            if ($("#timeSent_" + s).hasClass("highlighted")) {
                $scope.gohome()
            } else {
                $scope.makeSelection(s, d, "fromSent")
            }
        }

        $scope.clickingCircle = function(d) {
            var sentNr = d.sentNr;
            $scope.makeSelection(sentNr, d, "fromCircle");
        }

        $scope.highlightSent = function(d, docNr) {
            CreateTimeline.highlightSent(d, docNr)
        }
        $scope.scrollToSent = function(id, sent, docNr) {
            CreateTimeline.scrollToSent(id, sent, docNr)
        }

        $scope.updateD3Tl = function(tx, dcts, m, fct, nr) {
            CreateTimeline.updateD3Tl(tx, dcts, m, fct, nr);
        }

        $scope.highlightTimex = function(text, search) {
            if (!search) {
                return $sce.trustAsHtml(text);
            }
            // It's called 3 times... WHY?
            return $sce.trustAsHtml(text.replace(new RegExp(search, 'gi'), '<span class="hltx">$&</span>'));
        };
        $scope.countTxs = function(docNr, date) {
            var nr = 0;
            if (date == "event") {
                $scope.timexes.forEach(function(d) {
                    if (d.docNr == docNr && (d.typ == "date" || d.typ == "duration")) nr++
                })
            } else if (date == "vague") {
                $scope.timexes.forEach(function(d) {
                    if (d.docNr == docNr && d.typ == "neither") nr++
                })
            }
            return nr
        }


        $scope.switchView = function(v, c) {
            DateHandling.switchView(v, c)
        }
        $scope.hideDoc = function(v) {
            $scope.timexes = DateHandling.hideDoc(v, $scope.timexes);
            $scope.updateD3Tl($scope.timexes, $scope.dcts, "delete")
        }
        $scope.hideTrack = function(v) {
            $scope.timexes = DateHandling.hideTrack(v, $scope.timexes);
            $scope.updateD3Tl($scope.timexes, $scope.dcts, "delete")
        }

        $scope.loadData = function() {
                DateExporting.loadData($scope, $sce, CreateArray, CreateTimeline)
            }
            //$scope.prettifyDate = function(val){ prettifyDate(val) }
        $scope.arrowKey = function(dir, origin) {
            if ($scope.dateSelected) {

                var listLength = $('#listData tr').length
                var deleted = $('#listData .deleted').length

                // If timeline is all empty deselect everything
                if (listLength == deleted) {
                    $scope.dateSelected = false;
                } else {

                    var currListEl = parseInt($("#listEl_" + $scope.currIndex).index()) + 1
                    if (dir == "next") {
                        if (currListEl == listLength) {
                            var newIndex = 1
                        } else {
                            var newIndex = parseInt(currListEl) + 1
                        }
                        var newListEl = $("#listData tr:nth-child(" + newIndex + ")").attr("id").split("_")[1]

                        // If not visible go one further
                        while (!$scope.timexes[newListEl].visible) {
                            if (newIndex == listLength) {
                                newIndex = 1
                            } else {
                                newIndex++
                            }
                            newListEl = $("#listData tr:nth-child(" + newIndex + ")").attr("id").split("_")[1]
                        }
                    } else if (dir == "prev") {
                        if (currListEl == 1) {
                            var newIndex = listLength
                        } else {
                            var newIndex = parseInt(currListEl) - 1
                        }
                        var newListEl = $("#listData tr:nth-child(" + newIndex + ")").attr("id").split("_")[1]
                            // If not visible go one further
                        while (!$scope.timexes[newListEl].visible) {
                            if (newIndex == 1) {
                                newIndex = listLength
                            } else {
                                newIndex--
                            }
                            newListEl = $("#listData tr:nth-child(" + newIndex + ")").attr("id").split("_")[1]
                        }
                    }
                    if (!origin) origin = "arrowKey"
                    $scope.makeSelection($scope.timexes[newListEl].sentNr, $scope.timexes[newListEl], origin)
                }
            }
        }

        $(window).bind("resize", function() {
            if (this.id) clearTimeout(this.id);
            this.id = setTimeout($scope.updateD3Tl($scope.timexes, $scope.dcts, "resize"), 500);
        });

        $scope.loadData($scope, $sce, CreateArray, CreateTimeline)

    })

// SERVICES
.service('SplitSents', function() {

    this.splitthem = function(d) {
        var sents = d.split("<SENTENCES>")[1]
        sents = sents.split("</SENTENCES>")[0]
            //sents = sents.split("', '");
        sents = sents.split(/[\"\'],.?[\"\']/);
        return sents;
    }
})
app.service('CreateTimeline', function() {

    this.buildTl = function($scope) {

        d3.select("body").on("keydown", function() {
            var key = d3.event.keyCode
            if (key == 39 || key == 40) {
                $scope.arrowKey("next")
            } else if (key == 37 || key == 38) {
                $scope.arrowKey("prev")
            }

        });

        var chart = d3.timeline();
        chart
            .itemHeight(itemHeight)
            .margin({
                left: puffer / 2,
                right: puffer / 2,
                top: $("#topBox").height() - 70,
                bottom: puffer
            })
            .tickFormat({
                tickTime: d3.time.years,
                tickInterval: 5,
                tickSize: 10
            })
            .click(function(d, i, datum) {
                $scope.clickingCircle(datum)
            })

        var myTl = d3.select("#timeline").html("").append("svg")
            .attr("width", $("#topBox").width() - 20)
            .attr("height", $("#topBox").height() - 20)
            .attr("fill", "none")
            //.attr("viewBox","0,0,"+$("#topBox").width()+","+$("#topBox").height())

        myTl.append("g").attr("class", "ref") // Add group for reference lines
        myTl.datum($scope.timexes).call(chart)
        $scope.scaleFactor = scaleFactor;
        $scope.chart = chart;
        return $scope;
    }


    this.showDateInfo = function(datum) {

        var dateInfo = {}

        dateInfo.title = datum.title;
        dateInfo.subtitle = datum.sub;
        dateInfo.sent = datum.sent;
        dateInfo.typ = datum.typ;
        dateInfo.timex = datum.timex;
        dateInfo.trackNr = datum.trackNr;

        dateInfo.medium = []
        dateInfo.medium["source"] = datum.mediaSource;
        dateInfo.medium["credit"] = datum.mediaCredit;
        dateInfo.medium["caption"] = datum.mediaCaption;
        dateInfo.medium["hasMedia"] = datum.hasMedia;

        // Save current values
        dateInfo.currId = datum.id;
        dateInfo.currSent = datum.sentNr;

        return dateInfo
    }


    this.highlightSent = function(arr, docNr) {
        $(".timex").removeClass("highlighted");

        if (arr.length > 0) {
            arr.forEach(function(datum) {
                var s = datum.currSent;
                $("#timeSent_" + s).addClass("highlighted");
            })
        }
    }

    this.scrollToSent = function(thisid, sent, thisDocNr, view) {

        // List View
        var thisListEl = "#listEl_" + thisid
        var topListPos = $("#listData").scrollTop() + $(thisListEl).position().top - $("#listData").height() / 2 + $(thisListEl).height() / 2;
        $("#listData").animate({
            scrollTop: topListPos
        }, 300);

        // Text View
        var thisTextEl = "#timeSent_" + sent
        var topTextPos = $("#centerBox").scrollTop() + $(thisTextEl).position().top - $("#centerBox").height() / 2 + $(thisTextEl).height() / 2;
        $("#centerBox").animate({
            scrollTop: topTextPos
        }, 300);
    }

    this.updateD3Tl = function(tx, dcts, action, clickFct, nr) {
        // Check for duplicates, but don't reorder, because that would mess up D3 elements
        var d = checkDuplicatesWithoutOrdering(tx);


        // RESCALING AXIS
        var minTime = 1451606400000;
        var maxTime = -90000000000000; // Because 0 = 1970
        d.forEach(function(time, i) {
            if (time.visible) {
                var sT = time.times[0].starting_time;
                if (!isNaN(sT) && sT < minTime) {
                    minTime = time.times[0].starting_time;
                }
                var eT = time.times[0].ending_time;
                if (!isNaN(eT) && eT > maxTime) maxTime = time.times[0].ending_time;
            }
        });
        var beginning = minTime;
        var ending = maxTime;
        // If only one date on TL, readjust beginning and ending
        if (beginning == ending) {
            beginning = beginning - 157784630000
            ending = ending + 157784630000
        }
        // If no date on timeline, show 2000 till today
        if ((beginning == "????" || beginning == 946684800000) && ending == -90000000000000) {
            beginning = 946684800000
            ending = 1451606400000
        }

        var width = $("#topBox").width() - 30;
        var height = $("#timeline svg").height();

        var xScale = d3.time.scale()
            .domain([beginning, ending])
            .range([puffer / 2, width - puffer / 2]);

        var xAxis = d3.svg.axis().scale(xScale).ticks(15).tickSize(15)




        // READJUSTING PATHS
        if (beginning == 0) beginning = 1
        if (ending == 0) ending = 1

        //console.log("Beg: "+beginning+", End: "+ending)

        scaleFactor = (1 / (ending - beginning)) * (width - puffer);

        // Check height of SVG
        if (d.length != 0) {
            d = checkyIndizes(d, scaleFactor);
            var newHeight = $("#topBox").height()

            d.forEach(function(tx) {
                var elTop = tx.yIndex * itemHeight + 100
                if (tx.visible && newHeight < elTop) {
                    newHeight = elTop
                }
            })

            d3.select("svg").attr("height", newHeight - 10)
            d3.select("svg").selectAll("g.axis").attr("transform", "translate(0," + (parseInt(newHeight) - 55) + ")").call(xAxis);
            $("#timeline").scrollTop(newHeight);
        }


        if (action == "loadData") {
            d3.select("svg").select("g").selectAll(".timelineItem").remove()
        }

        if (action == "add" || action == "merge" || action == "newDoc" || action == "loadData") {

            var x = $("#timeline").width();

            var timexElements = d3.select("svg").select("g.allthedates").selectAll(".timelineItem").data(d).enter();
            timexElements
                .append('path')
                .attr("d", function(d) {
                    if (action == "merge") {
                        var newpath = $("#timelineItem_" + nr).attr("d");
                    } else {
                        if (d.typ == "date") return "M 300 -10 m -10, 0 a 10,10 0 1,0 20,0 a 10,10 0 1,0 -20,0"
                        else if (d.typ == "duration") return "M100 -10 L100 -5 L100 -6 L120 -5 L120 -5 L120 -10 L120 -7 L100-6 Z"
                        else return "M " + x + " 40 L" + x + " 20 L" + x + " 40 L" + x + " 40 L" + x + " 20 Z"
                    }

                })
                .attr("class", function(d) {

                    if (action == "newDoc" || action == "loadData") {
                        var classes = "timelineItem_sent_" + d.sentNr
                    } else {
                        var classes = ""
                    }

                    return "timelineItem " + d.typ + " " + classes

                })
                .attr("id", function(d) {
                    return "timelineItem_" + d.id
                })
                .attr("fill", function(d) {
                    return getColor(d)
                })
                .on("click", function(d) {
                    clickFct(d)
                })

        }


        // Add Reference Lines
        if (action == "newDoc") {
            var reflines = d3.select("svg").select("g.ref").selectAll("line").data(dcts).enter();
            reflines.append("svg:line")
                .attr("x1", function(t) {
                    var dctstamp = new Date(t.substr(0, 4) + "," + t.substr(5, 2) + "," + t.substr(8, 2)).getTime();
                    return puffer / 2 + (dctstamp - beginning) * scaleFactor;
                })
                .attr("y1", 0)
                .attr("x2", function(t) {
                    var dctstamp = new Date(t.substr(0, 4) + "," + t.substr(5, 2) + "," + t.substr(8, 2)).getTime();
                    return puffer / 2 + (dctstamp - beginning) * scaleFactor;
                })
                .attr("y2", $("#timeline svg").height())
                .attr("class", "refline")
                .style("stroke-dasharray", "3,5")

            reflines
                .append("text") // text label for the x axis
                .attr("x", function(t) {
                    var dctstamp = new Date(t.substr(0, 4) + "," + t.substr(5, 2) + "," + t.substr(8, 2)).getTime();
                    return puffer / 2 + (dctstamp - beginning) * scaleFactor + 3;
                })
                .attr("y", $("#timeline svg").height() - 3)
                .style("text-anchor", "left")
                .attr("class", "todaytag")
                .text("today");
        }


        // Update all paths - without transition, if shape changes from circle to span-shape
        if (action == "unitChange" || action == "vagueToDate") {
            var paths = d3.select("svg").selectAll(".timelineItem").data(d);
        } else {
            var paths = d3.select("svg").selectAll(".timelineItem").data(d).transition();
        }

        // Update all refs
        var refs = d3.select("svg").select("g.ref").selectAll("line").data(dcts).transition()
            .attr("x1", function(t) {
                var dctstamp = new Date(t.substr(0, 4) + "," + t.substr(5, 2) + "," + t.substr(8, 2)).getTime();
                return puffer / 2 + (dctstamp - beginning) * scaleFactor;
            })
            .attr("x2", function(t) {
                var dctstamp = new Date(t.substr(0, 4) + "," + t.substr(5, 2) + "," + t.substr(8, 2)).getTime();
                return puffer / 2 + (dctstamp - beginning) * scaleFactor;
            })
            .attr("y2", $("#timeline svg").height());
        d3.select("svg").select("g.ref").selectAll("text").data(dcts).transition()
            .attr("x", function(t) {
                var dctstamp = new Date(t.substr(0, 4) + "," + t.substr(5, 2) + "," + t.substr(8, 2)).getTime();
                return puffer / 2 + (dctstamp - beginning) * scaleFactor + 3;
            });

        paths
            .attr("d", function(d) {
                // line
                if (d.typ == "duration") {
                    return getLinePath(d, beginning, scaleFactor)
                }
                // date
                else if (d.typ == "date") {
                    return getCirclePath(d, beginning, scaleFactor)
                }
                //circle
                else {
                    return getSquarePath(d, beginning, scaleFactor)
                }
            })
            .attr("fill", function(d) {
                return getColor(d)
            })
            /*.attr("stroke-width" , function(d){
			if(d.visible){
				if(d.typ=="duration"){ return 0 }
				else{  return 2 }
			}
			else{ return 0 }
		})*/


        /* In case there will be any difference between move and delete */
        if (action == "resize") {
            var newHeight = $("#timeline svg").height()
            var newWidth = $("#topBox").width()

            d3.select("#timeline").select("svg")
                .attr("width", newWidth)
                .attr("height", newHeight)

            d3.select("#timeline").select("g.axis")
                .attr("transform", "translate(0," + (newHeight - 50) + ")")
        } else if (action == "recover") {}

        return d;
    }

})

app.service('CreateArray', function(SplitSents) {

    this.makeArray = function(timexes, file, nrIds, nrSents) {
        var sents = SplitSents.splitthem(file)
        var number = nrIds;

        // Look into each sentence to see if there are TIMEX2s
        for (var s = 0; s < sents.length; s++) {
            var thisS = sents[s];


            if (s == 0) {
                thisS = thisS.split("['")[1]
            }
            if (s == (sents.length - 1)) {
                thisS = thisS.split("']")[0]
            }



            // If there is a timex in the sentence:
            if (thisS.indexOf("TIMEX2") >= 0) {
                // How many Timexes?
                var nTimexes = thisS.split("</TIMEX2>");

                // CREATE DATA OBJECT
                var txsCount = nTimexes.length;

                // For all timexes inside one sentence
                for (var n = 0; n < txsCount - 1; n++) {

                    // Get: ID, Timex, Surrounding Sentence, Value, Mod, Count (=1)
                    var x = nTimexes[n]
                    var thistempex = x.split(/\<TIMEX2.*?\>/)[1].replace("&#039;", "'");
                    // Check if VAL
                    if (x.indexOf("VAL") >= 0) {
                        var thisVal = x.match(/VAL=\"([^<]*)\"/)[1]
                    } else {
                        var thisVal = x.split(">")[1];
                    }

                    // Check if MOD
                    if (x.indexOf("MOD") >= 0) {
                        var thisMod = x.match(/MOD=\"([^\"]*)\"/)[1]
                    } else {
                        var thisMod = "";
                    }


                    // Check if Time is transformable
                    var d = dateConversion(thisVal, thisMod)

                    // Sentence withough TIMEX2 Tags
                    thisS = cleanSubtitle(thisS)

                    var sub = thisS.split(' ').slice(0, 5).join(' ');

                    var sentNr = s + nrSents;
                    // Only add when transformable
                    if (d.typ == "date") {
                        if (thisVal == "PRESENT_REF") {
                            thisVal = dct.substr(0, 4) + dct.substr(5, 2) + dct.substr(8, 2)
                        }

                        timexes[number] = {
                            id: number,
                            docNr: docNr,
                            trackNr: trackNr,
                            timex: thistempex,
                            typ: "date",
                            touched: false,
                            sent: thisS,
                            sub: sub,
                            sentNr: sentNr,
                            val: thisVal,
                            title: prettifyDate(thisVal),
                            mod: thisMod,
                            count: 1,
                            yIndex: 1,
                            times: [{
                                starting_time: d.startVal,
                                ending_time: d.startVal
                            }],
                            mediaSource: "Enter URL",
                            mediaCredit: "Credit",
                            mediaCaption: "Caption",
                            hasMedia: false,
                            visible: true
                        };

                    }
                    // If Value is DURATION
                    else if (d.typ == "duration") {
                        var durTitle = d.startDate + " - " + d.endDate;
                        timexes[number] = {
                            id: number,
                            docNr: docNr,
                            trackNr: trackNr,
                            timex: thistempex,
                            typ: "duration",
                            touched: false,
                            sent: thisS,
                            sub: sub,
                            sentNr: sentNr,
                            val: durTitle,
                            title: durTitle,
                            mod: thisMod,
                            count: 1,
                            yIndex: 1,
                            times: [{
                                starting_time: d.startVal,
                                ending_time: d.endVal
                            }],
                            mediaSource: "Enter URL",
                            mediaCredit: "Credit",
                            mediaCaption: "Caption",
                            hasMedia: false,
                            visible: true
                        };
                    }
                    // If Value is no date
                    else {
                        var temporarySolution = "????"
                            //var subt = "I am not properly defined yet"
                        timexes[number] = {
                            id: number,
                            docNr: docNr,
                            trackNr: trackNr,
                            timex: thistempex,
                            typ: "neither",
                            touched: false,
                            sent: thisS,
                            sub: sub,
                            sentNr: sentNr,
                            val: temporarySolution,
                            title: "????",
                            mod: thisMod,
                            count: 1,
                            yIndex: 1,
                            times: [{
                                starting_time: temporarySolution,
                                ending_time: temporarySolution
                            }],
                            mediaSource: "Enter URL",
                            mediaCredit: "Credit",
                            mediaCaption: "Caption",
                            hasMedia: false,
                            visible: true
                        };
                    }
                    number++;
                }
            }
        }
        timexes = checkDuplicatesWithoutOrdering(timexes);
        //checkDuplicates(timexes);
        //$("#view_switch button").on("click" , function(){ $(".sidebar").toggleClass("activetab"); })
        return timexes;
    }

    this.recreateText = function(file, $sce, nrSents, nrIds) {
        var sents = SplitSents.splitthem(file)

        var txSents = [];

        var thisNewSent = ""
        var thisId = nrIds;
        for (var s = 0; s < sents.length; s++) {

            var thisS = sents[s];
            //thisS = thisS.replace(/\\n/g , " <br> ")
            // For first and last sent - remove [' or ']
            if (s == 0) {
                thisS = thisS.split("['")[1]
            }
            if (s == (sents.length - 1)) {
                thisS = thisS.split("']")[0]
            }
            var sentNr = s + nrSents;

            // If one ore more Timexes in Sentence
            if (thisS.indexOf("TIMEX2") >= 0) {
                var nTimexes = thisS.split("</TIMEX2>");
                var txSent = ""
                for (var n = 0; n < nTimexes.length; n++) {
                    /*if(n!=(nTimexes.length-1)){
		  			var span = "<span id='tx_"+thisId+"' class='tx txSent_"+sentNr+"'>"
		  			// Clicking on one ty-span triggers sentence click event as well - messes things up
		  			//var span = "<span id='tx_"+thisId+"' onclick='angular.element(this).scope().clickingCircle("+thisId+"); event.stopPropagation()' class='tx txSent_"+sentNr+"'>"
			            txSent += nTimexes[n].replace(/<TIMEX2([ ]*[^>]*)>/g , span)
			            txSent += "</span>"

			      	thisId++;
			      	}
		      	else{*/
                    txSent += nTimexes[n].replace(/<TIMEX2([ ]*[^>]*)>/g, "")
                        //txSent += nTimexes[n] //}

                }
                txSents[s] = {
                    sent: $sce.trustAsHtml(txSent),
                    tx: "Tx",
                    sentNr: sentNr,
                    id: thisId
                }
            }
            // No Timex in Sentence
            else {
                txSents[s] = {
                    sent: $sce.trustAsHtml(thisS),
                    tx: "NoTx",
                    sentNr: sentNr
                }
            }
        }
        return txSents;
    }
});

app.service('DateHandling', function() {

    this.makeSelection = function($scope, sentNr, d, origin) {

        $scope.editDate = false;
        $scope.addMedia = false;
        $scope.changeTrackVis = false;

        if (sentNr === false) {
            sentNr = -1
        }

        // If coming from Sentence selection, take first timex from sentence as new index
        if (origin == "fromSent") {
            var numberNewElement = d.length
            $scope.currIndex = $scope.timexes.indexOf(d[0]);
        } else {
            var numberNewElement = 1
            $scope.currIndex = $scope.timexes.indexOf(d);
        }

        for (var i = 0; i < numberNewElement; i++) {
            if (origin == "fromSent") {
                var thisD = d[i];
            } else {
                var thisD = d;
            }

            var newDate = $scope.showDateInfo(thisD);


            if ($scope.dateInfo[0] && $scope.dateInfo[0].currId == newDate.currId) {
                $scope.dateInfo = [];
            } else {
                if (i == 0) {
                    $scope.dateInfo = [];
                }
                $scope.dateInfo.push(newDate);
            }

        }
        if ($scope.dateInfo.length > 1) {
            $scope.severalSelected = true;
        } else {
            $scope.severalSelected = false;
        }

        // Highlighting Sentence (if path is connected to a sentence)
        if (sentNr != -1) {
            var thisDocNr = $scope.timexes[newDate.currId].docNr
            $scope.switchView(thisDocNr);
            /*if ($(".activeBtn")[0]){
				var activeDoc = $(".activeBtn").attr("id").split("_")[1]
				if(thisDocNr!=activeDoc){ $scope.switchView(thisDocNr); }
			}*/
            var thisId = newDate.currId
            var view = "text"

            $scope.highlightSent($scope.dateInfo, thisDocNr);
            $scope.scrollToSent(thisId, sentNr, thisDocNr)
        }
        // if manually added Date
        else {
            $(".timex").removeClass("highlighted");
        }

        // Highlighting List
        $(".listEl").removeClass("highlighted")
        $scope.dateInfo.forEach(function(d) {
            $("#listEl_" + d.currId).addClass("highlighted")
        })

        // Highlighting Circle
        d3.selectAll(".timelineItem").classed("selected", false).classed("selectedSec", false)
        $scope.dateInfo.forEach(function(d, i) {
            // First Selection is primar selection
            if (i == 0) {
                d3.select("#timelineItem_" + d.currId).classed("selected", true)
            } else {
                d3.select("#timelineItem_" + d.currId).classed("selectedSec", true)
            }
        })
        if ($scope.dateInfo.length != 0) {
            $scope.dateSelected = true
        } else {
            $scope.dateSelected = false
        }

        if (origin == "fromCircle" || origin == "arrowKey") $scope.$apply($scope.dateSelected); // apply needed, because Click on Circle is no ng-click

        // ARROW KEYS
        //if($scope.dateSelected){ $(document).on("keydown" , arrowKeys ) }
        //else{ $(document).off("keydown" , arrowKeys ) }
        // Adjust right box size
        var newMaxHeight = $("#rightBox").height() - $("#dateHead").height()
        $("#dateContent").css("height", newMaxHeight).scrollTop(0);
        return $scope;
    }

    this.switchView = function(v, c) {

        if (c && $("#button_" + v).hasClass("activeBtn")) {
            if ($("#docSwitcher").css("overflow") == "visible") {
                $("#docSwitcher").css("overflow", "hidden")
            } else {
                $("#docSwitcher").css("overflow", "visible")
            }
        } else {
            $(".txtData").removeClass("activetab")
            $(".docBtn").removeClass("activeBtn")
            $("#button_" + v).addClass("activeBtn")
            $("#txtData_" + v).addClass("activetab")
            $("#docList").animate({
                "top": (v * 27 * (-1))
            }, 200)
            $("#docSwitcher").css("overflow", "hidden")
        }

    }
    this.hideDoc = function(v, tx) {

        // If document is already inactive - reactivate it
        if ($("#button_" + v).hasClass("inactive")) {
            $("#button_" + v).removeClass("inactive")
            tx.forEach(function(el) {
                if (el.docNr == v) {
                    el.visible = true;
                }
            })
        }
        // If document is active - deactivate it
        else {
            $("#button_" + v).addClass("inactive")
            tx.forEach(function(el) {
                if (el.docNr == v) {
                    el.visible = false;
                }
            })
        }

        return tx;
    }

    this.hideTrack = function(v, tx) {

        // If document is already inactive - reactivate it
        if ($("#trackName_" + v).hasClass("inactive")) {
            $("#trackName_" + v).removeClass("inactive")
            tx.forEach(function(el) {
                if (el.trackNr == v) {
                    el.visible = true;
                }
            })
        }
        // If document is active - deactivate it
        else {
            $("#trackName_" + v).addClass("inactive")
            tx.forEach(function(el) {
                if (el.trackNr == v) {
                    el.visible = false;
                }
            })
        }

        return tx;
    }

});


app.service('DateExporting', function() {


    this.loadData = function($scope, $sce, CreateArray, CreateTimeline) {


        var mydata;

        var query = window.location.search.substring(1);

        if (query.indexOf("=") < 0) {
            console.log("Please specify the timeline inside the URL. For now you'll get an example timeline.");
            var tlname = "CatTimeline";
        } else {
            var tlname = query.split("=")[1];
        }

        var url = "http://s3-us-west-2.amazonaws.com/timelinecurator/" + tlname + ".tl"

        $.ajax({
            url: url,
            jsonp: false,
            jsonpCallback: 'callback',
            dataType: 'jsonp',
            success: function(data) {
                mydata = data;
                translateData();
            },
            error: function() {
                    console.log('Hmm, this Timeline doesn\'t seem to exist... We\'ll show you some kittens instead.');
                }
                // Try again
                /*$.ajax({
		                  url : "http://s3-us-west-2.amazonaws.com/timelinecurator/CatTimeline.tl",
					jsonp : false,
		 			jsonpCallback: 'callback',
					cache: 'true',
					dataType : 'jsonp',
					success: function(data) { mydata = data; translateData(); },
					error : function(){ alert("Something is wrong with the connection.") }
				});
                	}*/
        });

        var translateData = function() {
            $scope.timexes = [];

            $scope.timexes = mydata.timexes
            var newIndex = 0;
            $scope.timexes.forEach(function(el) {
                el.id = newIndex;
                newIndex++
            })

            $scope.tlDescr = mydata.tlDescr

            // Only show tracks that are used
            $scope.trackNames = [];
            var trackNrs = [];
            $scope.timexes.forEach(function(tx) {
                var trackNr = tx.trackNr.toString();
                if (trackNrs.indexOf(trackNr) == -1) {
                    trackNrs.push(trackNr);
                }
            })

            trackNrs.forEach(function(t, i) {
                $scope.trackNames[i] = []
                $scope.trackNames[i][0] = mydata.trackNames[trackNrs[i]]
                $scope.trackNames[i][1] = trackNrs[i]
            })

            var nrSents = 0
            var nrIds = 0
            $scope.fileNames = mydata.fileNames
            var thisFiles = mydata.files
            thisFiles.forEach(function(f, i) {
                $scope.singleSents[i] = CreateArray.recreateText(f, $sce, nrSents, nrIds)

                if (i != thisFiles.length - 1) {
                    nrSents += $scope.singleSents[i].length;
                    nrIds = $.grep($scope.timexes, function(el) {
                        return el.docNr == i;
                    }).length;
                }
            })
            $scope.updateD3Tl($scope.timexes, $scope.dcts, "loadData", $scope.clickingCircle)
            $scope.docNr = $scope.fileNames.length - 1
            docNr = $scope.fileNames.length - 1

            $scope.$apply($scope.singleSents)
            return $scope
        }

    }
})