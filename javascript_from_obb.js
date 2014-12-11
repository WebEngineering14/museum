/**
 * Created by Lucka on 10.12.2014.
 */
if (typeof gFSUGGEST == "undefined") {
    var gFSUGGEST = "defined";
    var gFSuggestInstanceCounter = 0;
    var gFSuggestInstances = new Array();
    bodySelect = true;
    blockHide = false;
    function FSuggest(a) {
        gFSuggestInstances[gFSuggestInstanceCounter] = this;
        this.instance = gFSuggestInstanceCounter++;
        this.currentInput = "";
        this.timer = null;
        this.clickSel = 0;
        this.scrollSel = 0;
        this.userInput = "";
        this.params = null;
        this.field = null;
        this.selectType = false;
        this.favorites = false;
        this.newJSONRequest = false;
        this.suggestMode = true;
        this.reenableButton;
        this.useTopFavorites = true;
        this.topMatches = 0;
        this.cookieMatches = 0;
        this.showSuggestionList = false;
        this.useperi = false;
        this.alphaSortEnabled = false;
        this.getSuggestFunctionality = function () {
            var value = "";
            if (document.cookie) {
                this.suggestMode = SLs.getCookieValue(document.cookie, "oebb-suggestMode=", ";");
                if (this.suggestMode != "") {
                    if (this.suggestMode == "false") {
                        this.showEnableButton();
                        this.params.useSuggest = false;
                    }
                }
            }
        };
        this.showEnableButton = function () {
            var field = this.field;
            var parameter = this;
            var instance = this.instance;
            gFSuggestInstances[instance].params.useSuggest = false;
            this.reenableButton = document.createElement("input");
            var decay = 1000 * 60 * 60 * 24 * 365;
            var now = new Date();
            var timeout = new Date(now.getTime() + decay);
            this.reenableButton.className = "suggestButton";
            this.reenableButton.type = "button";
            this.reenableButton.title = (typeof t_suggestionson != "undefined") ? t_suggestionson : "Enable Suggestions";
            this.reenableButton.onclick = function () {
                this.disabled = true;
                this.style.display = "none";
                parameter.params.useSuggest = true;
                document.cookie = "oebb-suggestMode=" + parameter.params.useSuggest + "; expires=" + timeout.toGMTString() + ";";
                for (var j = 0; j < gFSuggestInstanceCounter; j++) {
                    gFSuggestInstances[j].reenableButton.parentNode.removeChild(gFSuggestInstances[j].reenableButton);
                    gFSuggestInstances[j].field.style.width = (parseInt(gFSuggestInstances[j].field.style.width) + 10) + "px";
                    gFSuggestInstances[j].params.useSuggest = true;
                    SLs.inputField = field;
                }
                field.focus();
                SLs.extendedSearch = true;
                if (!SLs.container) {
                    if (field.value != "") {
                        fieldIndex = instance;
                        document.getElementsByTagName("body")[0].appendChild(SLs.erzeugen(instance));
                        this.newJSONRequest = true;
                        SLs.getJS(field.value + "?", instance);
                    }
                }
            };
            SLs.delete_SLs();
            this.field.style.width = (parseInt(this.field.style.width) - 10) + "px";
            this.field.parentNode.insertBefore(this.reenableButton, this.field.nextSibling);
        };
        this.toggleSuggestMode = function () {
            var decay = 1000 * 60 * 60 * 24 * 365;
            var now = new Date();
            var timeout = new Date(now.getTime() + decay);
            var field = this.field;
            var parameter = this.params;
            var suggestvalue;
            if (this.params.useSuggest == true) {
                this.params.useSuggest = false;
            } else {
                this.params.useSuggest = true;
            }
            for (var j = 0; j < gFSuggestInstanceCounter; j++) {
                gFSuggestInstances[j].showEnableButton();
                gFSuggestInstances[j].params.useSuggest = false;
            }
            document.cookie = "db4-suggestMode=" + parameter.useSuggest + "; expires=" + timeout.toGMTString() + ";";
            this.field.focus();
            this.params.useSuggest = suggestvalue;
        };
        this.toggleAlphaSort = function () {
            this.alphaSortEnabled = !this.alphaSortEnabled;
            if (this.alphaSortEnabled == false) {
                SLs.getJS(this.field.value + "?", this.instance);
            }
            window.setTimeout(function () {
                SLs.showSuggestion();
            }, 100);
        };
        this.changeOnSubmitOfMyFormular = function () {
            var f = this.field;
            while (f != null) {
                if (f.nodeName == "FORM") {
                    submitFunction = f.onsubmit;
                    f.onsubmit = new Function("ereignis", "return gFSuggestInstances[" + this.instance + "].cbonsubmit(ereignis);");
                    return;
                }
                f = f.parentNode;
            }
        };
        this.cbonsubmit = function () {
            if (SLs.container) {
                if (typeof(hideWaitIcon) == "function") {
                    hideWaitIcon();
                }
                SLs.inputField.focus();
                return false;
            } else {
                this.resetHafasSuggest();
                if (typeof(submitFunction) == "function") {
                    submitFunction();
                }
                return true;
            }
        };
        this.cbonkeyup = function (g) {
            test = this.field;
            currentKC = (g) ? g.keyCode : window.event.keyCode;
            if (this.timer) {
                window.clearTimeout(this.timer);
            }
            if (test.value.length < this.params.minChar && test.value.length > 0 && this.params.useSuggest == true) {
                if (currentKC != 40 && currentKC != 38 && currentKC != 9 && currentKC != 13) {
                    SLs.lastSLSlist = null;
                    var f = this.instance;
                    fieldIndex = f;
                    SLs.inputField = this.field;
                    SLs.delete_SLs(false, true);
                    SLs.inputField = this.field;
                    if (!SLs.container) {
                    }
                    if ((this.params.useSuggest == true) && ((typeof this.params.useTopFavorites == "undefined") || this.params.useTopFavorites == true)) {
                        SLs.fillWithCookieValues(this);
                    }
                } else {
                    this.suggestion(currentKC);
                }
            } else {
                if (test.value.length == 0) {
                    SLs.cachedSuggestions = null;
                    if (currentKC != 40 && currentKC != 38 && currentKC != 9 && currentKC != 13 && currentKC != 16) {
                        SLs.delete_SLs(false, true);
                    }
                }
                if (currentKC != 40 && currentKC != 38 && currentKC != 9 && currentKC != 18 && currentKC != 13 && test.value.length != 0) {
                    if ((SLs.checkUpdate(currentKC)) || (gFSuggestInstances[this.instance].params.useListCache == false)) {
                        if (this.params.useSuggest == true) {
                            this.timer = window.setTimeout("gFSuggestInstances[" + this.instance + "].suggestion(test, currentKC)", this.params.stopDelay);
                        }
                    } else {
                        SLs.showSuggestion();
                    }
                } else {
                    if (currentKC != 9) {
                        this.suggestion(currentKC);
                    }
                }
            }
        };
        this.cbonfocus = function (g) {
            if (document.getElementById("inputFieldHint" + this.field.id)) {
                document.getElementById("inputFieldHint" + this.field.id).style.display = "none";
            }
            gFSuggestInstances[this.instance].params.requestURL.match(/REQ0JourneyStopsS0A=(\d+)/);
            SLs.productbits = parseInt(RegExp.$1);
            SLs.chboxChecked = 3;
            test = this.field;
            if (this.timer) {
                window.clearTimeout(this.timer);
            }
            var f = this.instance;
            fieldIndex = f;
            SLs.inputField = this.field;
            if (test.value.length < this.params.minChar) {
                if ((this.params.useSuggest == true) && ((typeof this.params.useTopFavorites == "undefined") || this.params.useTopFavorites == true)) {
                    SLs.fillWithCookieValues(this);
                }
            }
        };
        this.cbonclick = function (f) {
            if (SLs.container) {
                SLs.delete_SLs();
            }
            currentField = (f) ? f.target : window.event.target;
            if (currentField.value.length < this.params.minChar && this.params.useSuggest == true) {
                if ((typeof this.params.useTopFavorites == "undefined") || this.params.useTopFavorites == true) {
                    SLs.fillWithCookieValues(this);
                }
            }
        };
        this.suggestion = function (f) {
            var g = this.instance;
            fieldIndex = g;
            SLs.inputField = this.field;
            if ((f == 40) && (SLs.container)) {
                if (SLs.container.getElementsByTagName("li")[SLs.countList + 1]) {
                    if (SLs.countList != -1) {
                        if ((SLs.container.getElementsByTagName("li")[SLs.countList].className != "infoLabel") || (SLs.container.getElementsByTagName("li")[SLs.countList].id == "suggestionMenu")) {
                            SLs.container.getElementsByTagName("li")[SLs.countList].className = SLs.container.getElementsByTagName("li")[SLs.countList].className.substr(0, SLs.container.getElementsByTagName("li")[SLs.countList].className.length - 8);
                            SLs.container.removeAttribute("aria-activedescendant");
                        }
                    } else {
                        SLs.container.scrollTop = 0;
                    }
                    while ((SLs.container.getElementsByTagName("li")[SLs.countList + 1].className == "infoLabel") && (SLs.container.getElementsByTagName("li")[SLs.countList + 1].className != "furtherMatches") && (SLs.container.getElementsByTagName("li")[SLs.countList + 1].id != "suggestionMenu")) {
                        SLs.countList++;
                    }
                    SLs.countList++;
                    SLs.container.scrollTop = SLs.currentTop * 15;
                    if (SLs.countList > SLs.currentBottom) {
                        SLs.container.scrollTop = SLs.container.scrollTop + 15;
                        SLs.currentBottom++;
                        SLs.currentTop++;
                    }
                    if ((SLs.container.getElementsByTagName("li")[SLs.countList].className != "infoLabel") || (SLs.container.getElementsByTagName("li")[SLs.countList].id == "suggestionMenu")) {
                        SLs.container.getElementsByTagName("li")[SLs.countList].className = SLs.container.getElementsByTagName("li")[SLs.countList].className + "selected";
                        SLs.container.setAttribute("aria-activedescendant", SLs.countList);
                    }
                }
            } else {
                if ((f == 38) && (SLs.container)) {
                    if (SLs.countList > 1) {
                        if (SLs.container.getElementsByTagName("li")[SLs.countList].className != "infoLabel") {
                            SLs.container.getElementsByTagName("li")[SLs.countList].className = SLs.classSelect(SLs.container.getElementsByTagName("li")[SLs.countList].className, "selected");
                            SLs.container.removeAttribute("aria-activedescendant");
                        }
                        SLs.countList--;
                        while ((SLs.container.getElementsByTagName("li")[SLs.countList].className == "infoLabel") && (SLs.countList > 0)) {
                            SLs.countList--;
                        }
                        if (SLs.countList == -1) {
                            this.setSLSInput(SLs, this.userInput, SLs.countList);
                        } else {
                            SLs.container.scrollTop = SLs.currentTop * 15;
                            if (SLs.countList < SLs.currentTop) {
                                SLs.container.scrollTop = SLs.container.scrollTop - 15;
                                SLs.currentTop--;
                                SLs.currentBottom--;
                            }
                            if ((SLs.container.getElementsByTagName("li")[SLs.countList].className != "infoLabel") || (SLs.container.getElementsByTagName("li")[SLs.countList].id == "suggestionMenu")) {
                                SLs.container.getElementsByTagName("li")[SLs.countList].className = SLs.container.getElementsByTagName("li")[SLs.countList].className + "selected";
                                SLs.container.setAttribute("aria-activedescendant", SLs.countList);
                            }
                        }
                    }
                } else {
                    if (f != 9 && f != 16 && f != 13) {
                        this.userInput = this.field.value;
                        if (SLs.container) {
                            SLs.delete_SLs(false);
                            SLs.countList = -1;
                        }
                        if (gFSuggestInstances[fieldIndex].params.useSuggest) {
                            if (this.field.value.length >= this.params.minChar) {
                                var suggestContainer = document.getElementsByTagName("body")[0].appendChild(SLs.erzeugen(fieldIndex));
                                if (this.params.requestType == "ajax") {
                                    SLs.holen(this.field.value + "?", fieldIndex);
                                } else {
                                    this.newJSONRequest = true;
                                    SLs.getJS(this.field.value + "?", fieldIndex);
                                }
                            } else {
                                SLs.fillWithCookieValues(this);
                            }
                        }
                    } else {
                        if (f == 13) {
                            if ((SLs.countList != -1) && typeof SLs.container.getElementsByTagName("li")[SLs.countList] != "undefined") {
                                if (SLs.container) {
                                    if ((SLs.countList == -1) && (this.waitingActive == false)) {
                                        SLs.countList = 0;
                                        while (SLs.container.getElementsByTagName("li")[SLs.countList].className == "infoLabel") {
                                            SLs.countList++;
                                        }
                                    }
                                    if (SLs.countList > -1) {
                                        if ((SLs.countList > -1) && (SLs.container.getElementsByTagName("li")[SLs.countList].className.indexOf("furtherMatches") == -1) && (SLs.container.getElementsByTagName("li")[SLs.countList].className != "infoLabelselected")) {
                                            var content = SLs.clearHTMLTags(SLs.container.getElementsByTagName("li")[SLs.countList].lastChild.innerHTML);
                                            this.setSLSInput(SLs, content, SLs.container.getElementsByTagName("li")[SLs.countList].id);
                                            SLs.delete_SLs();
                                        } else {
                                            if (this.field.value.length > 0 && SLs.container.getElementsByTagName("li")[SLs.countList].className == "furtherMatchesselected") {
                                                SLs.showAllSuggestions();
                                            } else {
                                                if (typeof content != "undefined") {
                                                    this.setSLSInput(SLs, content, 0);
                                                } else {
                                                    gFSuggestInstances[fieldIndex].toggleSuggestMode();
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        };
        this.leaveInputField = function (evt) {
            if (document.getElementById("inputFieldHint" + this.field.id) && (this.field.value.length == 0)) {
                document.getElementById("inputFieldHint" + this.field.id).style.display = "block";
            }
            if (SLs.container) {
                if (this.scrollSel && this.scrollSel == 1 && !this.clickSel) {
                    SLs.inputField.focus();
                    this.scrollSel = 0;
                } else {
                    if (this.clickSel == 1) {
                        SLs.inputField.focus();
                        this.clickSel = 0;
                    } else {
                        if ((SLs.countList > -1) && (SLs.container != null) && (SLs.container.getElementsByTagName("li")[SLs.countList].className != "infoLabel")) {
                            if ((SLs.container.getElementsByTagName("li")[SLs.countList].id != "suggestionMenu") && (SLs.container.getElementsByTagName("li")[SLs.countList].className != "furtherMatchesselected")) {
                                var content = SLs.clearHTMLTags(SLs.container.getElementsByTagName("li")[SLs.countList].lastChild.innerHTML);
                                this.setSLSInput(SLs, content, SLs.container.getElementsByTagName("li")[SLs.countList].id);
                            }
                            window.setTimeout(function () {
                                SLs.delete_SLs();
                            }, 200);
                        } else {
                            SLs.delete_SLs();
                        }
                    }
                }
            }
        };
        this.resetHafasSuggest = function () {
        };
        this.setInputFieldValue = function (g, f) {
            if (typeof g.inputField != "undefined") {
                g.inputField.value = f;
            }
        };
        this.setSLSInput = function (j, g, h) {
            this.setInputFieldValue(j, g);
            var f = "";
            var k = "";
            if (typeof j.sls.suggestions[h] != "undefined") {
                if (typeof j.sls.suggestions[h].id != "undefined") {
                    this.setTripleId(j.sls.suggestions[h].id);
                    j.sls.suggestions[h].id.match(/L=(\d+)/);
                    k = RegExp.$1;
                }
                if (typeof j.sls.suggestions[h].type != "undefined") {
                    this.setLocationType(j.sls.suggestions[h].type);
                    f = j.sls.suggestions[h].type;
                }
                if (typeof this.params.selectCallback != "undefined") {
                    j.sls.suggestions[h].evaId = k;
                    this.params.selectCallback(j.sls.suggestions[h]);
                }
            } else {
                if (typeof SLs.combinedMatches[h] != "undefined") {
                    this.setTripleId(SLs.combinedMatches[h].id);
                    if (typeof SLs.combinedMatches[h].type != "undefined") {
                        this.setLocationType(SLs.combinedMatches[h].type);
                        f = SLs.combinedMatches[h].type;
                    }
                    if (typeof this.params.selectCallback != "undefined") {
                        this.params.selectCallback(SLs.combinedMatches[h]);
                    }
                }
            }
        };
        this.setTripleId = function (h) {
            if (typeof this.params.type != "undefined") {
                if (this.field.name.charAt(this.field.name.length - 1) == "G") {
                    var f = this.field.name.replace(/G$/, "ID");
                } else {
                    var f = "REQ0JourneyStops" + this.params.type + "ID";
                }
                var g = null;
                if (document.getElementsByName(f)) {
                    g = document.getElementsByName(f)[0];
                }
                if (g == null || typeof g == "undefined") {
                    g = document.createElement("input");
                    g.type = "hidden";
                    g.name = f;
                    this.field.parentNode.insertBefore(g, this.field.nextSibling);
                }
                g.value = h;
            }
        };
        this.setLocationType = function (g) {
            if ((typeof this.params.type != "undefined") && ((this.field.name.match(/G$/) != null) || (this.field.name == "S") || (this.field.name == "Z"))) {
                if (this.field.name == "S") {
                    f = "REQ0JourneyStopsS0A";
                } else {
                    if (this.field.name == "Z") {
                        f = "REQ0JourneyStopsZ0A";
                    } else {
                        var f = this.field.name.replace(/G$/, "A");
                    }
                }
                var h = document.getElementsByName(f)[0];
                if ((h != null) && ((h.nodeName == "SELECT") || ((h.value != 7) && (h.value != 255)))) {
                    h.value = g;
                } else {
                    if (h != null) {
                        var i = document.getElementById("ignoreTypeCheck");
                        if ((i == null) || (typeof(i) == "undefined")) {
                            i = document.createElement("input");
                            i.type = "hidden";
                            i.name = "ignoreTypeCheck";
                            i.id = "ignoreTypeCheck";
                            i.value = "yes";
                            this.field.parentNode.insertBefore(i, this.field);
                        }
                    } else {
                        var i = document.createElement("input");
                        i.type = "hidden";
                        i.name = f;
                        i.value = g;
                        this.field.parentNode.insertBefore(i, this.field);
                    }
                }
            }
        };
        if (this.instance == 0) {
            document.body.onmousedown = function () {
                if (document.getElementById("suggestion") && bodySelect) {
                    SLs.delete_SLs();
                }
                bodySelect = true;
            };
        }
        this.params = {
            useListCache: false,
            useTypeFilter: false,
            useTopFavorites: a.useTopFavorites,
            loc: a.loc,
            type: a.type,
            minChar: a.minChar,
            requestURL: a.requestURL,
            useDisableFunc: (typeof a.useDisableFunc == "undefined") ? true : a.useDisableFunc,
            useMapLimiter: a.useMapLimiter,
            scrollCheck: a.scrollCheck,
            cookiename: a.cookiename,
            stopDelay: a.stopDelay,
            requestType: a.requestType,
            useSuggest: a.useSuggest,
            useMaps: false,
            useProducts: false,
            useWrap: false,
            minMatch: 1,
            selectCallback: a.selectCallback,
            onProductButton: a.onProductButton,
            onMapButton: a.onMapButton,
            width: a.width,
            onShow: a.onShow,
            minimizeList: true
        };
        a.requestURL.match(/REQ0JourneyStopsS0A=(\d+)/);
        if ((RegExp.$1) >= 7) {
            this.params.useTypeFilter = false;
        } else {
            this.params.useTypeFilter = false;
        }
        a.requestURL.match(/REQ0JourneyStopsB=(\d+)/);
        this.params.amount = RegExp.$1;
        if (typeof(this.params.requestType) == "undefined") {
            this.params.requestType = "js";
        }
        if (typeof(this.params.useSuggest) == "undefined") {
            this.params.useSuggest = true;
        }
        if (typeof this.params.loc != "undefined" && typeof document.getElementById(this.params.loc) != "undefined") {
            this.field = document.getElementById(this.params.loc);
            var b = true;
            for (var c = 0; c < this.instance; c++) {
                if (gFSuggestInstances[c].field.form == this.field.form) {
                    b = false;
                }
            }
            if (b) {
                this.changeOnSubmitOfMyFormular();
            }
            this.field.setAttribute("autocomplete", "off");
            this.field.setAttribute("aria-autocomplete", "list");
            this.field.setAttribute("role", "textbox");
            this.field.setAttribute("aria-haspopup", "true");
            this.field.setAttribute("aria-owns", "suggestion");
            this.field.onfocus = function () {
                currentInput = this.value;
            };
            this.field.onkeyup = new Function("ereignis", "gFSuggestInstances[" + this.instance + "].cbonkeyup(ereignis);");
            this.field.onkeydown = function (evt) {
                var currentKC = (evt) ? evt.keyCode : window.event.keyCode;
                if (currentKC != 9) {
                    tabPressed = false;
                } else {
                    tabPressed = true;
                }
            };
            this.field.onfocus = new Function("ereignis", "gFSuggestInstances[" + this.instance + "].cbonfocus(ereignis);");
            this.field.onblur = new Function("ereignis", "window.clearTimeout(gFSuggestInstances[" + this.instance + "].timer);gFSuggestInstances[" + this.instance + "].leaveInputField(ereignis);");
            if (this.params.setFocus == "yes" && (this.instance == 0)) {
                var d = this.field;
                var e = true;
                while (d) {
                    if ((d.tagName == "BODY") || (d.tagName == "HTML")) {
                        break;
                    }
                    if ((d.style.display == "none") || (d.style.visibility == "hidden")) {
                        e = false;
                        break;
                    }
                    d = d.parentNode;
                }
                if (e) {
                    this.field.focus();
                }
            }
        }
        this.getSuggestFunctionality();
    }
}
var SLs = {
    productbits: 255,
    chboxChecked: 3,
    waitingActive: false,
    container: null,
    currLocation: null,
    ajax: false,
    div_breite: "auto",
    div_hoehe: 170,
    countList: -1,
    currentTop: 0,
    currentBottom: 9,
    inputField: null,
    pos_x: 0,
    pos_y: 0,
    sls: null,
    lastSLSlist: null,
    topCities: null,
    minimap: null,
    cachedSuggestions: null,
    extendedSearch: false,
    erzeugen: function (a) {
        if (typeof gSuggest_for_company == "undefined") {
            this.topCities = {
                suggestions: [{
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000013",
                    xcoord: "10885568",
                    ycoord: "48365444",
                    value: "Augsburg Hbf",
                    id: "A=1@O=Augsburg Hbf@X=10885568@Y=48365444@U=80@L=008000013@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8096003",
                    xcoord: "13386987",
                    ycoord: "52520501",
                    value: "BERLIN",
                    id: "A=1@O=BERLIN@X=13386987@Y=52520501@U=80@L=008096003@B=1@p=1229512662@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000036",
                    xcoord: "8532722",
                    ycoord: "52029258",
                    value: "Bielefeld Hbf",
                    id: "A=1@O=Bielefeld Hbf@X=8532722@Y=52029258@U=80@L=008000036@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000041",
                    xcoord: "7224109",
                    ycoord: "51478651",
                    value: "Bochum Hbf",
                    id: "A=1@O=Bochum Hbf@X=7224109@Y=51478651@U=80@L=008000041@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8010060",
                    xcoord: "12566245",
                    ycoord: "52400765",
                    value: "Brandenburg Hbf",
                    id: "A=1@O=Brandenburg Hbf@X=12566245@Y=52400765@U=80@L=008010060@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000050",
                    xcoord: "8813833",
                    ycoord: "53083477",
                    value: "Bremen Hbf",
                    id: "A=1@O=Bremen Hbf@X=8813833@Y=53083477@U=80@L=008000050@B=1@p=1229512662@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000068",
                    xcoord: "8629635",
                    ycoord: "49872503",
                    value: "Darmstadt Hbf",
                    id: "A=1@O=Darmstadt Hbf@X=8629635@Y=49872503@U=80@L=008000068@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000080",
                    xcoord: "7459293",
                    ycoord: "51517898",
                    value: "Dortmund Hbf",
                    id: "A=1@O=Dortmund Hbf@X=7459293@Y=51517898@U=80@L=008000080@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000086",
                    xcoord: "6774783",
                    ycoord: "51430019",
                    value: "Duisburg Hbf",
                    id: "A=1@O=Duisburg Hbf@X=6774783@Y=51430019@U=80@L=008000086@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000085",
                    xcoord: "6794316",
                    ycoord: "51219960",
                    value: "D&#252;sseldorf Hbf",
                    id: "A=1@O=Düsseldorf Hbf@X=6794316@Y=51219960@U=80@L=008000085@B=1@p=1229512662@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8010101",
                    xcoord: "11038501",
                    ycoord: "50972549",
                    value: "Erfurt Hbf",
                    id: "A=1@O=Erfurt Hbf@X=11038501@Y=50972549@U=80@L=008010101@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000098",
                    xcoord: "7014795",
                    ycoord: "51451351",
                    value: "Essen Hbf",
                    id: "A=1@O=Essen Hbf@X=7014795@Y=51451351@U=80@L=008000098@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000105",
                    xcoord: "8663785",
                    ycoord: "50107149",
                    value: "Frankfurt(Main)Hbf",
                    id: "A=1@O=Frankfurt(Main)Hbf@X=8663785@Y=50107149@U=80@L=008000105@B=1@p=1229512662@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8010113",
                    xcoord: "14545724",
                    ycoord: "52336833",
                    value: "Frankfurt(Oder)",
                    id: "A=1@O=Frankfurt(Oder)@X=14545724@Y=52336833@U=80@L=008010113@B=1@p=1229512662@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "657137",
                    xcoord: "7100920",
                    ycoord: "51505385",
                    value: "Gelsenkirchen Hauptbahnhof",
                    id: "A=1@O=Gelsenkirchen Hauptbahnhof@X=7100920@Y=51505385@U=80@L=000657137@B=1@p=1231875322@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000128",
                    xcoord: "9925682",
                    ycoord: "51536614",
                    value: "Göttingen",
                    id: "A=1@O=Göttingen@X=9925682@Y=51536614@U=80@L=008000128@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8096009",
                    xcoord: "9965836",
                    ycoord: "53563816",
                    value: "HAMBURG",
                    id: "A=1@O=HAMBURG@X=9965836@Y=53563816@U=80@L=008096009@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000152",
                    xcoord: "9741016",
                    ycoord: "52376763",
                    value: "Hannover Hbf",
                    id: "A=1@O=Hannover Hbf@X=9741016@Y=52376763@U=80@L=008000152@B=1@p=1229512662@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "699275",
                    xcoord: "10131310",
                    ycoord: "54315979",
                    value: "Kiel Hauptbahnhof",
                    id: "A=1@O=Kiel Hauptbahnhof@X=10131310@Y=54315979@U=80@L=000699275@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8096022",
                    xcoord: "6967206",
                    ycoord: "50941312",
                    value: "KÖLN",
                    id: "A=1@O=KÖLN@X=6967206@Y=50941312@U=80@L=008096022@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000240",
                    xcoord: "8258722",
                    ycoord: "50001112",
                    value: "Mainz Hbf",
                    id: "A=1@O=Mainz Hbf@X=8258722@Y=50001112@U=80@L=008000240@B=1@p=1229512662@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000261",
                    xcoord: "11558338",
                    ycoord: "48140228",
                    value: "München Hbf",
                    id: "A=1@O=München Hbf@X=11558338@Y=48140228@U=80@L=008000261@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000294",
                    xcoord: "8061669",
                    ycoord: "52272686",
                    value: "Osnabrück Hbf",
                    id: "A=1@O=Osnabrück Hbf@X=8061669@Y=52272686@U=80@L=008000294@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8010304",
                    xcoord: "12131706",
                    ycoord: "54078323",
                    value: "Rostock Hbf",
                    id: "A=1@O=Rostock Hbf@X=12131706@Y=54078323@U=80@L=008010304@B=1@p=1232975975@"
                }, {
                    type: "1",
                    typeStr: "[Bhf/Hst]",
                    evaId: "8000096",
                    xcoord: "9181636",
                    ycoord: "48784081",
                    value: "Stuttgart Hbf",
                    id: "A=1@O=Stuttgart Hbf@X=9181636@Y=48784081@U=80@L=008000096@B=1@p=1232975975@"
                }]
            };
        } else {
            if (gSuggest_for_company == "oebb") {
                this.topCities = {
                    suggestions: [{
                        type: "1",
                        typeStr: "[Bhf/Hst]",
                        evaId: "8196001",
                        xcoord: "16341553",
                        ycoord: "48207036",
                        value: "WIEN",
                        id: "A=1@O=WIEN@X=16341553@Y=48207036@U=80@L=008196001@B=1@p=1248698221@"
                    }, {
                        type: "1",
                        typeStr: "[Bhf/Hst]",
                        evaId: "8100085",
                        xcoord: "14313577",
                        ycoord: "46615604",
                        value: "Klagenfurt Hbf",
                        id: "A=1@O=Klagenfurt Hbf@X=14313577@Y=46615604@U=81@L=008100085@B=1@p=1275041666@"
                    }, {
                        type: "1",
                        typeStr: "[Bhf/Hst]",
                        evaId: "8100108",
                        xcoord: "11400749",
                        ycoord: "47262890",
                        value: "Innsbruck Hbf",
                        id: "A=1@O=Innsbruck Hbf@X=11401018@Y=47263043@U=81@L=008100108@B=1@p=1275041666@"
                    }, {
                        type: "1",
                        typeStr: "[Bhf/Hst]",
                        evaId: "8100173",
                        xcoord: "15417093",
                        ycoord: "47071815",
                        value: "GRAZ",
                        id: "A=1@O=GRAZ@X=15417093@Y=47071815@U=81@L=001160100@B=1@p=1284363331@"
                    }, {
                        type: "1",
                        typeStr: "[Bhf/Hst]",
                        evaId: "8100002",
                        xcoord: "13044067",
                        ycoord: "47813650",
                        value: "Salzburg Hbf",
                        id: "A=1@O=Salzburg Hbf@X=13045559@Y=47812823@U=81@L=008100002@B=1@p=1275041666@"
                    }, {
                        type: "1",
                        typeStr: "[Bhf/Hst]",
                        evaId: "8100013",
                        xcoord: "14291077",
                        ycoord: "48288964",
                        value: "Linz/Donau Hbf",
                        id: "A=1@O=Linz/Donau Hbf@X=14291814@Y=48290150@U=81@L=008100013@B=1@p=1275041666@"
                    }, {
                        type: "1",
                        typeStr: "[Bhf/Hst]",
                        evaId: "8100008",
                        xcoord: "15625912",
                        ycoord: "48207683",
                        value: "St.Pölten Hbf",
                        id: "A=1@O=St.Pölten Hbf@X=15623800@Y=48208331@U=81@L=008100008@B=1@p=1275041666@"
                    }, {
                        type: "1",
                        typeStr: "[Bhf/Hst]",
                        evaId: "8100147",
                        xcoord: "13847603",
                        ycoord: "46618004",
                        value: "Villach Hbf",
                        id: "A=1@O=Villach Hbf@X=13848709@Y=46618624@U=81@L=008100147@B=1@p=1275041666@"
                    }, {
                        type: "1",
                        typeStr: "[Bhf/Hst]",
                        evaId: "8100147",
                        xcoord: "9739578",
                        ycoord: "47502884",
                        value: "BREGENZ",
                        id: "A=1@O=BREGENZ@X=9739578@Y=47502884@U=81@L=001180207@B=1@p=1284363331@"
                    }, {
                        type: "1",
                        typeStr: "[Bhf/Hst]",
                        evaId: "8100147",
                        xcoord: "16529499",
                        ycoord: "47839422",
                        value: "EISENSTADT",
                        id: "A=1@O=EISENSTADT@X=16529499@Y=47839422@U=81@L=001110101@B=1@p=1284363331@"
                    }]
                };
            }
        }
        gFSuggestInstances[fieldIndex].params.requestURL.match(/REQ0JourneyStopsS0A=(\d+)/);
        if (document.getElementById("suggestion") == null) {
            SLs.container = document.createElement("ul");
            SLs.container.id = "suggestion";
            SLs.container.setAttribute("role", "listbox");
            SLs.container.setAttribute("tabindex", "0");
            SLs.container.setAttribute("aria-activedescendant", "0");
        } else {
            SLs.container = document.getElementById("suggestion");
        }
        if (navigator.userAgent.toLowerCase().indexOf("opera") > -1) {
            SLs.container.style.minWidth = "148px";
        }
        if (typeof gFSuggestInstances[fieldIndex].params.width != "undefined") {
            SLs.container.style.width = gFSuggestInstances[fieldIndex].params.width;
        } else {
            if (typeof SLs.inputField.style.width != "undefined") {
                SLs.container.style.width = SLs.inputField.style.width;
            } else {
                SLs.container.style.width = "310px";
            }
        }
        SLs.container.style.height = "auto";
        SLs.pos_x = SLs.getPosX(SLs.inputField) + 0;
        SLs.pos_y = SLs.getPosY(SLs.inputField) + 16;
        SLs.container.style.left = SLs.pos_x + "px";
        SLs.container.style.top = SLs.pos_y + "px";
        if (gFSuggestInstances[fieldIndex].params.scrollCheck) {
            SLs.scrollChecker = window.setInterval("SLs.scrollCheck()", 50);
        }
        SLs.container.onmousedown = new Function("ereignis", "bodySelect=false;if((navigator.userAgent.toLowerCase().indexOf('msie')>-1)||(navigator.userAgent.toLowerCase().indexOf('safari')>-1))gFSuggestInstances[fieldIndex].scrollSel=1;");
        return SLs.container;
    },
    scrollCheck: function () {
        SLs.pos_x = SLs.getPosX(SLs.inputField) + 0;
        SLs.pos_y = SLs.getPosY(SLs.inputField) + 16;
        SLs.container.style.left = SLs.pos_x + "px";
        SLs.container.style.top = SLs.pos_y + "px";
    },
    speichern: function (userInput, liste) {
        if (this.cachedSuggestions == null) {
            this.cachedSuggestions = new Array();
            this.cachedSuggestions[userInput] = liste;
        } else {
            if (this.cachedSuggestions[userInput] == null) {
                this.cachedSuggestions[userInput] = liste;
                return true;
            } else {
                return false;
            }
        }
    },
    waiting: function () {
        SLs.waitingActive = true;
        if (typeof document.getElementById("waiting") == "undefined" || document.getElementById("waiting") == null) {
            var waitingscreen = document.body.appendChild(document.createElement("div"));
            SLs.pos_x = SLs.getPosX(SLs.inputField) + 1;
            SLs.pos_y = SLs.getPosY(SLs.inputField) + 20;
            waitingscreen.style.left = SLs.pos_x - 3 + "px";
            waitingscreen.style.top = SLs.pos_y + 5 + "px";
            waitingscreen.style.position = "absolute";
            waitingscreen.id = "waiting";
            waitingscreen.innerHTML = "|";
            waitingscreen.style.height = "10px";
            waitingscreen.style.width = "33px";
            waitingscreen.style.fontSize = "4px";
            waitingscreen.style.zIndex = "20000000";
            waitingscreen.style.color = "#B8C6D6";
            waitingscreen.style.backgroundImage = 'url("' + gImagePath + 'wait_ani.gif")';
            waitingscreen.style.display = "block";
        } else {
            document.getElementById("waiting").style.display = "block";
            SLs.pos_x = SLs.getPosX(SLs.inputField) + 1;
            SLs.pos_y = SLs.getPosY(SLs.inputField) + 20;
            document.getElementById("waiting").style.left = SLs.pos_x - 3 + "px";
            document.getElementById("waiting").style.top = SLs.pos_y + 5 + "px";
        }
    },
    stopWaiting: function () {
        SLs.waitingActive = false;
        if (document.getElementById("waiting") != null) {
            document.getElementById("waiting").style.display = "none";
        }
    },
    laden: function (input) {
        if (this.cachedSuggestions != null) {
            return this.cachedSuggestions[input];
        }
    },
    holen: function (input, fieldIndex) {
        try {
            SLs.ajax = new XMLHttpRequest();
        } catch (w3c) {
            try {
                SLs.ajax = new ActiveXObject("Msxml2.XMLHTTP");
            } catch (msie) {
                try {
                    SLs.ajax = new ActiveXObject("Microsoft.XMLHTTP");
                } catch (msie_alt) {
                    SLs.delete_SLs();
                    for (var i = 0; i < gFSuggestInstances.length; i++) {
                        var f = document.getElementById(gFSuggestInstances[i].params.loc);
                        if (f) {
                            f.onfocus = null;
                            f.onkeyup = null;
                            f.onblur = null;
                            f.onclick = null;
                        }
                    }
                    return false;
                }
            }
        }
        var tempURL = gFSuggestInstances[fieldIndex].params.requestURL + input + "&";
        var typeSelectName = gFSuggestInstances[fieldIndex].field.name.replace(/G$/, "A");
        var typeSelectbox = document.getElementsByName(typeSelectName)[0];
        if ((typeSelectbox != null) && (typeSelectbox.nodeName == "SELECT")) {
            var replaceTypeRegExp = /REQ0JourneyStopsS0A=(\d+)&/;
            tempURL = tempURL.replace(replaceTypeRegExp, "REQ0JourneyStopsS0A=" + typeSelectbox.value + "&");
            gFSuggestInstances[fieldIndex].selectType = true;
        }
        if (gFSuggestInstances[fieldIndex].params.locType && document.getElementById(gFSuggestInstances[fieldIndex].params.locType + "_hidden")) {
            var currentLocType = document.getElementById(gFSuggestInstances[fieldIndex].params.locType + "_hidden").value;
            tempURL = tempURL + gFSuggestInstances[fieldIndex].params.requestURL2 + currentLocType + "&";
        }
        SLs.ajax.open("GET", tempURL, true);
        SLs.ajax.setRequestHeader("Content-Type", "text/xml");
        SLs.ajax.setRequestHeader("If-Modified-Since", "Sat, 1 Jan 2000 00:00:00 GMT");
        SLs.ajax.send(null);
        SLs.ajax.onreadystatechange = function () {
            if (SLs.ajax.readyState == 4) {
                if (SLs.ajax.status != 200) {
                    SLs.delete_SLs();
                    return false;
                }
                if (SLs.ajax.responseText) {
                    eval(SLs.ajax.responseText);
                    return SLs.showSuggestion();
                }
                var nicht_gefunden = document.createTextNode("No suggestions for your input '" + input + "'.");
                SLs.container.appendChild(nicht_gefunden);
                return false;
            }
        };
    },
    getBoldCharacters: function (word, suggestion, j) {
        return suggestion.replace(new RegExp("(?![^&;]+;)(?!<[^<>]*)(" + word.replace(/([\^\$\(\)\[\]\{\}\*\.\+\?\|\\])/gi, "\\$1") + ")(?![^<>]*>)(?![^&;]+;)", "gi"), "<b>$1</b>");
    },
    removeSpecialChars: function (word) {
        word = word.replace(/\>/g, "");
        return word;
    },
    upperCaseFirst: function (str) {
        var f = str.charAt(0).toUpperCase();
        for (var j = 1; j < str.length; j++) {
            f += str.charAt(j).toLowerCase();
        }
        return f;
    },
    addMenu: function (showAlphaSort) {
        if (gFSuggestInstances[fieldIndex].params.useDisableFunc) {
            var labelSuggestions = document.createElement("li");
            labelSuggestions.setAttribute("role", "menuitem");
            labelSuggestions.style.textAlign = "right";
            if ((typeof showAlphaSort == "undefined") || (showAlphaSort == true)) {
                var alphaSort = document.createElement("a");
                alphaSort.id = "suggestAlphaSort";
                if (!gFSuggestInstances[fieldIndex].alphaSortEnabled) {
                    var alphaSortLabel = (typeof t_alphasort != "undefined") ? t_alphasort : "Sort alphabetically";
                } else {
                    var alphaSortLabel = (typeof t_alphasortoff != "undefined") ? t_alphasortoff : "Normal sort";
                }
                alphaSort.innerHTML = alphaSortLabel;
                alphaSort.onmousedown = function () {
                    gFSuggestInstances[fieldIndex].toggleAlphaSort();
                };
                labelSuggestions.appendChild(alphaSort);
                var divider = document.createElement("span");
                divider.innerHTML = "&nbsp;|&nbsp;";
                labelSuggestions.appendChild(divider);
            }
            var closeButton = document.createElement("a");
            closeButton.className = "closeButton";
            labelSuggestions.id = "suggestionMenu";
            labelSuggestions.setAttribute("tabindex", "-1");
            closeButton.innerHTML = (typeof t_suggestionsoff != "undefined") ? t_suggestionsoff : "Disable Suggestions";
            closeButton.onmousedown = function () {
                gFSuggestInstances[fieldIndex].toggleSuggestMode();
            };
            labelSuggestions.appendChild(closeButton);
            labelSuggestions.className = "infoLabel";
            if (gFSuggestInstances[fieldIndex].params.useMaps == true) {
                var separator = document.createElement("span");
                separator.innerHTML = " | ";
                labelSuggestions.appendChild(separator);
                var closeMap = document.createElement("a");
                closeMap.className = "closeButton";
                if (gFSuggestInstances[fieldIndex].params.useMaps) {
                    closeMap.innerHTML = (typeof t_minimapoff != "undefined") ? t_minimapoff : "Disable mini-map";
                } else {
                    closeMap.innerHTML = (typeof t_minimapon != "undefined") ? t_minimapon : "Enable mini-map";
                }
                closeMap.onclick = function () {
                    if (document.getElementById("geomap") == null) {
                        SLs.createGeoBox();
                    }
                    if (gFSuggestInstances[fieldIndex].params.useMaps == true) {
                        this.innerHTML = " " + (typeof t_minimapon != "undefined") ? t_minimapon : "Enable mini-map";
                        document.getElementById("geomap").style.display = "none";
                        gFSuggestInstances[fieldIndex].params.useMaps = true;
                    } else {
                        document.getElementById("geomap").style.display = "block";
                        this.innerHTML = " " + (typeof t_minimapoff != "undefined") ? t_minimapoff : "Disable mini-map";
                        gFSuggestInstances[fieldIndex].params.useMaps = false;
                    }
                    gFSuggestInstances[fieldIndex].params.useMaps = !(gFSuggestInstances[fieldIndex].params.useMaps);
                };
                labelSuggestions.appendChild(closeMap);
            }
            SLs.container.appendChild(labelSuggestions);
        }
    },
    checkPrefix: function (prefix, id) {
        id.match(/@L=(\d+)/);
        var extId = RegExp.$1;
        var prefix = extId.substr(2, 2);
        if (prefix == "81") {
            return true;
        } else {
            return false;
        }
    },
    showSuggestion: function () {
        if (gFSuggestInstances[fieldIndex].params.useSuggest) {
            if (SLs.currLocation != null) {
                geoMap.hideContent(SLs.currLocation);
                geoMap.removeContent(SLs.currLocation);
            }
            if (!SLs.container) {
                document.getElementsByTagName("body")[0].appendChild(SLs.erzeugen(fieldIndex));
            }
            SLs.container.innerHTML = "";
            SLs.addMenu();
            gFSuggestInstances[fieldIndex].topMatches = 0;
            if (gFSuggestInstances[fieldIndex].params.useTopFavorites == true) {
                topcities = this.addTopCities();
            }
            gFSuggestInstances[fieldIndex].params.requestURL.match(/REQ0JourneyStopsS0A=(\d)/);
            var d = RegExp.$1;
            if (navigator.userAgent.indexOf("Safari") > -1) {
                var e = "right: 18px;";
            } else {
                if (navigator.userAgent.indexOf("MSIE") > -1) {
                    var e = "right: 0px;";
                } else {
                    var e = "right: 0px;";
                }
            }
            SLs.lastSLSlist = SLs.sls.suggestions;
            if (gFSuggestInstances[fieldIndex].newJSONRequest) {
                var saved = SLs.speichern(gFSuggestInstances[fieldIndex].field.value, SLs.sls.suggestions);
            }
            gFSuggestInstances[fieldIndex].newJSONRequest = false;
            var c = new Array();
            var addedSuggestions = 0;
            var labelSuggestions = document.createElement("li");
            labelSuggestions.style.textAlign = "right";
            labelSuggestions.innerHTML = (typeof t_suggestions != "undefined") ? t_suggestions : "Suggestions";
            labelSuggestions.className = "infoLabel";
            labelSuggestions.setAttribute("tabindex", "-1");
            labelSuggestions.setAttribute("role", "menuitem");
            SLs.container.appendChild(labelSuggestions);
            var maxSuggestions;
            if ((typeof topcities != "undefined") && (topcities != 0)) {
                maxSuggestions = SLs.sls.suggestions.length - (topcities - 1);
            } else {
                maxSuggestions = SLs.sls.suggestions.length;
            }
            if (gFSuggestInstances[fieldIndex].alphaSortEnabled) {
                SLs.sls.suggestions = SLs.sls.suggestions.sort(SLs.alphaSort);
            }
            for (var b = 0; b < maxSuggestions; b++) {
                if (SLs.container) {
                    if (SLs.checkForMatches("substr", gFSuggestInstances[fieldIndex].field.value, SLs.sls.suggestions[b].value) || gFSuggestInstances[fieldIndex].showSuggestionList == true || gFSuggestInstances[fieldIndex].params.minimizeList == true) {
                        c[b] = SLs.container.appendChild(document.createElement("li"));
                        c[b].setAttribute("role", "menuitem");
                        c[b].setAttribute("tabindex", "-1");
                        c[b].id = addedSuggestions;
                        addedSuggestions++;
                        if (SLs.sls.suggestions[b].typeStr == "[POI]" || SLs.sls.suggestions[b].type == "4") {
                            c[b].className = "poi";
                        } else {
                            if (SLs.sls.suggestions[b].typeStr == "[Adr]" || SLs.sls.suggestions[b].type == "2") {
                                c[b].className = "adr";
                            } else {
                                if (SLs.sls.suggestions[b].type == "1") {
                                    if (this.checkPrefix("81", SLs.sls.suggestions[b].id)) {
                                        if ((SLs.sls.suggestions[b].prodClass & 2280) != 0) {
                                            c[b].className = "metahst";
                                        } else {
                                            c[b].className = "oebb";
                                        }
                                    } else {
                                        if ((SLs.sls.suggestions[b].prodClass & 63) != 0) {
                                            c[b].className = "metahst";
                                        }
                                    }
                                }
                            }
                        }
                        var extIdExtract = parseInt(SLs.sls.suggestions[b].extId, 10);
                        extIdExtract = extIdExtract.toString();
                        if (extIdExtract.indexOf("11") == 0) {
                            c[b].className = "meta";
                        } else {
                            if (extIdExtract.indexOf("13") == 0) {
                                if ((SLs.sls.suggestions[b].prodClass & 63) != 0) {
                                    c[b].className = "metahst";
                                }
                            }
                        }
                        if (((d == 7) || (d == 255) || (d == 5)) && (typeof(SLs.sls.suggestions[b].typeStr) != "undefined") && (!gFSuggestInstances[fieldIndex].selectType)) {
                            var a = SLs.sls.suggestions[b].typeStr;
                        } else {
                            var a = "";
                        }
                        if (gFSuggestInstances[fieldIndex].params.useProducts == true && typeof SLs.sls.suggestions[b].prodClass != "undefined") {
                            var product = SLs.getProductIcon(SLs.sls.suggestions[b].prodClass, SLs.sls.suggestions[b].value);
                        }
                        if ((typeof SLs.sls.suggestions[b].prodClass != "undefined") && (parseInt(SLs.sls.suggestions[b].type) == 1)) {
                            var weight = "";
                            weight = "";
                        } else {
                            weight = "";
                        }
                        var tmpSuggestion = SLs.sls.suggestions[b].value;
                        var userInput = gFSuggestInstances[fieldIndex].field.value;
                        tmpSuggestion = SLs.replaceSpecialChars(tmpSuggestion);
                        var wordlength = gFSuggestInstances[fieldIndex].field.value.length;
                        var matchedWordStart = tmpSuggestion.toUpperCase().indexOf(userInput.toUpperCase());
                        var inputTokens = new Array();
                        inputTokens = userInput.split(" ");
                        for (var k = 0; k < inputTokens.length; k++) {
                            if (inputTokens[k] != "") {
                                tmpSuggestion = this.getBoldCharacters(inputTokens[k], tmpSuggestion, 0);
                            }
                        }
                        resultString = tmpSuggestion;
                        var iconsRight = "";
                        var wrapStyle = "";
                        if (gFSuggestInstances[fieldIndex].params.useWrap) {
                            wrapStyle = ' style="height:auto;word-wrap:break-word;display:block;width:233px;white-space:pre-wrap"';
                        }
                        iconsRight = SLs.addIcons(SLs.sls.suggestions[b].xcoord, SLs.sls.suggestions[b].ycoord, SLs.sls.suggestions[b].value);
                        c[b].innerHTML = "<span style='margin-right:3px;display: block;position: absolute; color:#4d4d4d;font-style:italic;" + e + "'><span id='pr_" + b + "'></span>" + iconsRight + (typeof weight != "undefined" && weight != 0 ? weight : "") + "</span><span" + wrapStyle + ">" + resultString + "</span>";
                        if ((typeof product != "undefined") && (typeof product != "string") && SLs.sls.suggestions[b].type == 1) {
                            document.getElementById("pr_" + b).appendChild(product);
                        }
                        c[b].onmousedown = function () {
                            gFSuggestInstances[fieldIndex].clickSel = 1;
                            var content = this.lastChild.innerHTML;
                            content = SLs.clearHTMLTags(content);
                            gFSuggestInstances[fieldIndex].setSLSInput(SLs, content, parseInt(this.id));
                            SLs.delete_SLs();
                        };
                        c[b].onmouseover = function () {
                            SLs.mouseSelect(this, "bottom");
                            if (gFSuggestInstances[fieldIndex].params.useMaps == true) {
                            }
                        };
                        c[b].onmouseout = function () {
                            this.className = SLs.classSelect(this.className, "selected");
                            if (gFSuggestInstances[fieldIndex].params.useMaps == true) {
                                SLs.restoreOldZoom();
                            }
                        };
                    }
                } else {
                    return false;
                }
            }
        }
        if (gFSuggestInstances[fieldIndex].params.useTypeFilter) {
            this.addTypeFilter();
        }
        if (SLs.sls.suggestions.length >= 12 && SLs.extendedSearch == true) {
            this.addFurtherMatchesButton();
        }
        gFSuggestInstances[fieldIndex].showSuggestionList = false;
        SLs.container.style.borderWidth = "1px";
        SLs.container.style.zIndex = "10002";
        if (SLs.sls.length < 10) {
            SLs.container.style.height = "auto";
        } else {
            SLs.container.style.height = "auto";
        }
        if (navigator.userAgent.toLowerCase().indexOf("msie") > -1) {
        }
        if (navigator.userAgent.toLowerCase().indexOf("msie") > -1 && navigator.userAgent.indexOf("7.0") < 0) {
            if (SLs.container.scrollHeight > (SLs.div_hoehe + 124)) {
                SLs.container.style.height = SLs.div_hoehe + 124 + "px";
                SLs.container.overflow = "auto";
            } else {
                SLs.container.style.height = "auto";
            }
            SLs.hideSelect();
        }
        if (SLs.container.scrollWidth > SLs.container.clientWidth) {
            var addWidth = 5;
            if (SLs.container.scrollHeight > SLs.container.clientHeight) {
                addWidth += 20;
            }
            SLs.container.style.width = SLs.container.scrollWidth + addWidth + "px";
        }
        if (SLs.sls.suggestions.length < 1 || addedSuggestions == 0) {
            if (SLs.sls.suggestions.length != 0) {
                gFSuggestInstances[fieldIndex].showSuggestionList = true;
                gFSuggestInstances[fieldIndex].newJSONRequest = true;
                SLs.getJS(gFSuggestInstances[fieldIndex].field.value + "?", fieldIndex, false);
            }
        }
        if (typeof gFSuggestInstances[fieldIndex].params.onShow != "undefined") {
            gFSuggestInstances[fieldIndex].params.onShow();
            SLs.lastZoom = geoMap.getZoom();
        }
        return true;
    },
    showAllSuggestions: function () {
        SLs.delete_SLs(true, false);
        gFSuggestInstances[fieldIndex].showSuggestionList = true;
        gFSuggestInstances[fieldIndex].newJSONRequest = true;
        gFSuggestInstances[fieldIndex].scrollSel = 1;
        gFSuggestInstances[fieldIndex].clickSel = 1;
        SLs.getJS(gFSuggestInstances[fieldIndex].field.value + "?", fieldIndex, true);
        gFSuggestInstances[fieldIndex].field.focus();
    },
    addMapButton: function (x, y, desc) {
        if (typeof fsugg_map != "undefined") {
            var tmp = '<span onmouseout="SLs.restoreOldZoom();" onmouseover="SLs.showGeoMap(\'' + x + "','" + y + "','" + desc + "');\">" + fsugg_map + "</span>";
            return tmp;
        }
    },
    addProductsButton: function () {
        var tmp = "<span>" + SLs.getProducts() + "</span>";
        return tmp;
    },
    addIcons: function (x, y, desc) {
        var icons = "";
        if (gFSuggestInstances[fieldIndex].params.useProducts) {
            icons += SLs.addProductsButton();
        }
        if (gFSuggestInstances[fieldIndex].params.useMaps) {
            icons += " " + SLs.addMapButton(x, y, desc);
        }
        return icons;
    },
    alphaSort: function (a, b) {
        if (a.value.toLowerCase() > b.value.toLowerCase()) {
            return 1;
        } else {
            if (a.value.toLowerCase() < b.value.toLowerCase()) {
                return -1;
            } else {
                return 0;
            }
        }
    },
    toggleChbox: function () {
        if (document.getElementById("ch_stop").checked == true) {
            document.getElementById("ch_stop").disabled = true;
        } else {
            if (document.getElementById("ch_poi").checked == true) {
                document.getElementById("ch_poi").disabled = true;
            } else {
                if (document.getElementById("ch_address").checked == true) {
                    document.getElementById("ch_address").disabled = true;
                }
            }
        }
    },
    createCheckbox: function (id, index, bitval) {
        var ch = document.createElement("input");
        ch.type = "checkbox";
        ch.id = id;
        ch.onclick = function () {
            if (!this.checked) {
                SLs.productbits = parseInt(SLs.productbits) - parseInt(index);
                var prodStr = SLs.productbits;
                SLs.chboxChecked--;
                if (SLs.chboxChecked == 1) {
                    SLs.toggleChbox();
                }
            } else {
                SLs.productbits = parseInt(SLs.productbits) + parseInt(index);
                SLs.chboxChecked++;
            }
            SLs.delete_SLs();
            SLs.getJS(gFSuggestInstances[fieldIndex].field.value + "?", fieldIndex, false);
        };
        if (parseInt(bitval) == 1) {
            ch.checked = true;
            if (SLs.chboxChecked == 1) {
                ch.disabled = true;
            }
        }
        return ch;
    },
    addTypeFilter: function () {
        var bits_binary = SLs.productbits.toString(2);
        var typefilter = document.createElement("div");
        typefilter.className = "infoLabel";
        typefilter.id = "typefilter";
        typefilter.appendChild(SLs.createCheckbox("ch_stop", 1, bits_binary.charAt(bits_binary.length - 1)));
        var label1 = typefilter.appendChild(document.createElement("label"));
        label1.innerHTML = "Hst.";
        typefilter.appendChild(SLs.createCheckbox("ch_address", 2, bits_binary.charAt(bits_binary.length - 2)));
        var label2 = typefilter.appendChild(document.createElement("label"));
        label2.innerHTML = "Adressen";
        typefilter.appendChild(SLs.createCheckbox("ch_poi", 4, bits_binary.charAt(bits_binary.length - 3)));
        var label3 = typefilter.appendChild(document.createElement("label"));
        label3.innerHTML = "POI";
        SLs.container.appendChild(typefilter);
    },
    addFurtherMatchesButton: function () {
        var showAllMatches = document.createElement("li");
        showAllMatches.style.textAlign = "left";
        showAllMatches.className = "furtherMatches";
        showAllMatches.style.borderTop = "1px solid #333333";
        showAllMatches.setAttribute("role", "menuitem");
        showAllMatches.innerHTML = (typeof t_furtherMatches != "undefined") ? t_furtherMatches : "Show additional matches...";
        showAllMatches.onmousedown = function () {
            SLs.showAllSuggestions();
        };
        SLs.container.appendChild(showAllMatches);
    },
    mouseSelect: function (obj, mode) {
        if (SLs.countList != -1 && SLs.container.getElementsByTagName("li")[SLs.countList].className) {
            var oldClassName = SLs.container.getElementsByTagName("li")[SLs.countList].className;
            if (oldClassName != "infoLabel") {
                SLs.container.getElementsByTagName("li")[SLs.countList].className = SLs.classSelect(oldClassName, "selected");
            }
        }
        obj.className += "selected";
        if (mode == "bottom") {
            SLs.countList = parseInt(obj.id) + 1 + gFSuggestInstances[fieldIndex].topMatches;
        } else {
            SLs.countList = parseInt(obj.id) + 1;
        }
    },
    addTopCities: function () {
        SLs.container.style.height = SLs.div_hoehe + 120 + "px";
        gFSuggestInstances[fieldIndex].params.requestURL.match(/REQ0JourneyStopsS0A=(\d)/);
        var d = RegExp.$1;
        if (navigator.userAgent.indexOf("Safari") > -1) {
            var e = "right: 18px;";
        } else {
            if (navigator.userAgent.indexOf("MSIE") > -1) {
                var e = "right: 18px;";
            } else {
                var e = "right: 0px;";
            }
        }
        var c = new Array();
        var addedSuggestions = 0;
        SLs.combinedMatches = new Array();
        if (typeof historyList != "undefined") {
            if (historyList.suggestions.length > 0) {
                SLs.addLabel(t_lastInput, "lastinput");
            }
            for (var j = 0; j < historyList.suggestions.length; j++) {
                SLs.combinedMatches[SLs.combinedMatches.length] = historyList.suggestions[j];
            }
            for (var k = 0; k < SLs.topCities.suggestions.length; k++) {
                if (k == 0) {
                    var labelPosTopMatches = SLs.combinedMatches.length;
                }
                SLs.combinedMatches[SLs.combinedMatches.length] = SLs.topCities.suggestions[k];
            }
        } else {
            SLs.combinedMatches = SLs.topCities.suggestions;
        }
        for (var b = 0; b < SLs.combinedMatches.length; b++) {
            if (SLs.container) {
                if ((typeof labelPosTopMatches != "undefined") && (b == labelPosTopMatches)) {
                    if (SLs.topCities.suggestions.length > 0) {
                        SLs.addLabel(t_topMatches, "topmatches");
                    }
                }
                var tmpSuggestion = SLs.combinedMatches[b].value;
                tmpSuggestion = SLs.replaceSpecialChars(tmpSuggestion);
                var userInput = gFSuggestInstances[fieldIndex].field.value;
                var matchedWordStart;
                var inputTokens = new Array();
                inputTokens = userInput.split(" ");
                matchedWordStart = tmpSuggestion.toUpperCase().indexOf(userInput.toUpperCase());
                if (matchedWordStart != 0) {
                    matchedWordStart = -1;
                }
                if ((SLs.checkForMatches("substr", userInput, tmpSuggestion) && addedSuggestions < 6) || userInput == "") {
                    c[addedSuggestions] = SLs.container.appendChild(document.createElement("li"));
                    c[addedSuggestions].id = b;
                    if (SLs.combinedMatches[b].type == "4") {
                        c[addedSuggestions].className = "poi";
                    } else {
                        if (SLs.combinedMatches[b].type == "2") {
                            c[addedSuggestions].className = "adr";
                        } else {
                            if (SLs.combinedMatches[b].type == "1") {
                                if (this.checkPrefix("81", SLs.combinedMatches[b].id)) {
                                    c[addedSuggestions].className = "oebb";
                                }
                            }
                        }
                    }
                    if (((d == 7) || (d == 255) || (d == 5)) && (typeof(SLs.combinedMatches[addedSuggestions].typeStr) != "undefined") && (!gFSuggestInstances[fieldIndex].selectType)) {
                        var a = SLs.combinedMatches[addedSuggestions].typeStr;
                    } else {
                        var a = "";
                    }
                    var wordlength = gFSuggestInstances[fieldIndex].field.value.length;
                    for (var k = 0; k < inputTokens.length; k++) {
                        if (inputTokens[k] != "") {
                            tmpSuggestion = this.getBoldCharacters(inputTokens[k], tmpSuggestion, 0);
                        }
                    }
                    resultString = tmpSuggestion;
                    var iconsRight = "";
                    iconsRight = SLs.addIcons(SLs.combinedMatches[b].xcoord, SLs.combinedMatches[b].ycoord, SLs.combinedMatches[b].value);
                    c[addedSuggestions].innerHTML = "<span style='margin-right:3px;display: block;position: absolute;" + e + "'>" + iconsRight + "</span><span>" + resultString + "</span>";
                    c[addedSuggestions].onmousedown = function () {
                        gFSuggestInstances[fieldIndex].clickSel = 1;
                        var content = this.lastChild.innerHTML;
                        content = SLs.clearHTMLTags(content);
                        gFSuggestInstances[fieldIndex].setSLSInput(SLs, content, parseInt(this.id));
                        SLs.delete_SLs();
                    };
                    c[addedSuggestions].onmouseover = function () {
                        SLs.mouseSelect(this, "top");
                    };
                    c[addedSuggestions].onmouseout = function () {
                        this.className = SLs.classSelect(this.className, "selected");
                    };
                    addedSuggestions++;
                }
            }
        }
        return addedSuggestions;
    },
    getJS: function (d, f, ngramm_ext) {
        SLs.waiting();
        var backupURL;
        if (ngramm_ext == true) {
            gFSuggestInstances[f].params.requestURL = gFSuggestInstances[f].params.requestURL.replace("REQ0JourneyStopsB=" + gFSuggestInstances[f].params.amount, "REQ0JourneyStopsB=50");
            this.extendedSearch = false;
        } else {
            gFSuggestInstances[f].params.requestURL = gFSuggestInstances[f].params.requestURL.replace("REQ0JourneyStopsB=50", "REQ0JourneyStopsB=" + gFSuggestInstances[f].params.amount);
            this.extendedSearch = true;
        }
        var h = gFSuggestInstances[f].params.requestURL + d + "&";
        if (typeof(this.selectPerimeterFilterParam) == "string") {
            h += this.selectPerimeterFilterParam + "&";
        }
        if (this.selectPerimeterFilterParam != null) {
            this.selectPerimeterFilterParam = "";
        }
        var c = gFSuggestInstances[f].field.name.replace(/G$/, "A");
        var g = document.getElementsByName(c)[0];
        if ((g != null) && (g.nodeName == "SELECT")) {
            var b = /REQ0JourneyStopsS0A=(\d+)&/;
            h = h.replace(b, "REQ0JourneyStopsS0A=" + g.value + "&");
            gFSuggestInstances[f].selectType = true;
        }
        if (gFSuggestInstances[f].params.locType && document.getElementById(gFSuggestInstances[f].params.locType + "_hidden")) {
            var a = document.getElementById(gFSuggestInstances[f].params.locType + "_hidden").value;
            h = h + gFSuggestInstances[f].params.requestURL2 + a + "&";
        }
        if (document.getElementById("hafasCallJS") != null) {
            document.getElementsByTagName("head")[0].removeChild(document.getElementById("hafasCallJS"));
        }
        var e = document.createElement("script");
        e.type = "text/javascript";
        e.src = h + "js=true&";
        e.id = "hafasCallJS";
        e.onload = function () {
            SLs.stopWaiting();
        };
        e.onreadystatechange = function () {
            if ((this.readyState == "complete") || (this.readyState == "loaded")) {
                SLs.stopWaiting();
            }
        };
        e.onerror = function () {
            SLs.stopWaiting();
            if (SLs.container != null) {
                SLs.delete_SLs();
            }
        };
        document.getElementsByTagName("head")[0].appendChild(e);
    },
    hafasurl2utf8: function (a) {
        a = a.replace(/\+/g, "%20");
        a = a.replace(/%A7/g, "%C2%A7");
        a = a.replace(/%E4/g, "%C3%A4");
        a = a.replace(/%F6/g, "%C3%B6");
        a = a.replace(/%FC/g, "%C3%BC");
        a = a.replace(/%DF/g, "%C3%9F");
        a = a.replace(/%C4/g, "%C3%84");
        a = a.replace(/%D6/g, "%C3%96");
        a = a.replace(/%DC/g, "%C3%9C");
        a = a.replace(/%E9/g, "%C3%A9");
        return a;
    },
    getCookieValue: function (d, c, b) {
        if (typeof d == "undefined" || d == "") {
            return "";
        }
        var e = d.search(c);
        if (e < 0) {
            return "";
        }
        var a = d.substr(e + c.length);
        e = a.search(b);
        if (e > 0) {
            a = a.substr(0, e);
        }
        return decodeURIComponent(a);
    },
    fillWithCookieValues: function (h) {
        if (!SLs.container) {
            document.getElementsByTagName("body")[0].appendChild(SLs.erzeugen(fieldIndex));
        }
        if ((typeof h.params.cookiename == "undefined") && (gFSuggestInstances[fieldIndex].useTopFavorites != true)) {
            return;
        }
        var j = document.cookie;
        var b = h.params.cookiename;
        j = this.getCookieValue(j, b + "=", ";");
        if ((j == "") && (gFSuggestInstances[fieldIndex].useTopFavorites != true)) {
            return;
        }
        j = this.getCookieValue(j, "history=", ";");
        if ((j == "") && (gFSuggestInstances[fieldIndex].useTopFavorites != true)) {
            return;
        }
        j = this.hafasurl2utf8(j);
        if (!SLs.container) {
            document.getElementsByTagName("body")[0].appendChild(SLs.erzeugen(this.instance));
        }
        var k = new Array;
        var e = 0;
        for (var a = 1; a <= 6; a++) {
            var d = this.getCookieValue(j, "Stop" + a, "&");
            if (d != "") {
                k[e] = new Object;
                k[e].text = d;
                e++;
            }
        }
        SLs.sls = new Object;
        SLs.sls.suggestions = new Array;
        for (a = 0; a < k.length; a++) {
            SLs.sls.suggestions[a] = new Object;
            SLs.sls.suggestions[a].id = this.getCookieValue(k[a].text, "§L=", "§");
            SLs.sls.suggestions[a].value = this.getCookieValue(k[a].text, "O=", "@");
            SLs.sls.suggestions[a].type = this.getCookieValue(k[a].text, "A=", "@");
        }
        var l = new Array();
        var g = "right: 0px;";
        var topcities;
        gFSuggestInstances[fieldIndex].topMatches = 0;
        SLs.addMenu(false);
        if (gFSuggestInstances[fieldIndex].useTopFavorites == true && gFSuggestInstances[fieldIndex].field.value.length >= 0) {
            topcities = this.addTopCities();
        }
        var addedSuggestions = 0;
        for (var c = 0; c < SLs.sls.suggestions.length; c++) {
            if (SLs.container) {
                if (SLs.checkForMatches("substr", gFSuggestInstances[fieldIndex].field.value, SLs.sls.suggestions[c].value)) {
                    var tmpSuggestion = SLs.sls.suggestions[c].value;
                    var userInput = gFSuggestInstances[fieldIndex].field.value;
                    tmpSuggestion = SLs.replaceSpecialChars(tmpSuggestion);
                    l[addedSuggestions] = SLs.container.appendChild(document.createElement("li"));
                    l[addedSuggestions].id = addedSuggestions;
                    if ((typeof(historyCookieTypeString) != "undefined") && (typeof(historyCookieTypeString[SLs.sls.suggestions[c].type]) != "undefined")) {
                        var f = "<span style='display: block;position: absolute; background-color: #fff;" + g + "'>" + historyCookieTypeString[SLs.sls.suggestions[c].type] + "</span>";
                    } else {
                        var f = "";
                    }
                    if (SLs.sls.suggestions[c].type == 4) {
                        l[addedSuggestions].className = "poi";
                    } else {
                        if (SLs.sls.suggestions[c].type == 2) {
                            l[addedSuggestions].className = "adr";
                        }
                    }
                    l[addedSuggestions].innerHTML = f + "<span>" + this.getBoldCharacters(userInput, tmpSuggestion, 0) + "</span>";
                    l[addedSuggestions].onmousedown = function () {
                        var content = this.lastChild.innerHTML;
                        content = content.replace(/<b>/g, "");
                        content = content.replace(/<\/b>/g, "");
                        gFSuggestInstances[fieldIndex].clickSel = 1;
                        gFSuggestInstances[fieldIndex].setSLSInput(SLs, content, parseInt(this.id));
                    };
                    l[addedSuggestions].onmouseover = function () {
                        SLs.mouseSelect(this, "bottom");
                    };
                    l[addedSuggestions].onmouseout = function () {
                        this.className = SLs.classSelect(this.className, "selected");
                    };
                    addedSuggestions++;
                }
            } else {
                return false;
            }
        }
        if (addedSuggestions == 0) {
        } else {
            var labelSuggestions = document.createElement("li");
            labelSuggestions.innerHTML = "Favouriten";
            labelSuggestions.style.textAlign = "right";
            labelSuggestions.className = "infoLabel";
            labelSuggestions.setAttribute("tabindex", "-1");
            SLs.container.insertBefore(labelSuggestions, l[0]);
        }
        if (addedSuggestions == 0 && topcities == 0 && gFSuggestInstances[fieldIndex].params.useSuggest == true) {
            var labelSuggestions = document.createElement("li");
            labelSuggestions.innerHTML = t_suggestHint1 + gFSuggestInstances[fieldIndex].params.minChar + " " + t_suggestHint2;
            labelSuggestions.style.wordWrap = "break-word";
            labelSuggestions.className = "infoLabel";
            labelSuggestions.setAttribute("tabindex", "-1");
            labelSuggestions.id = "note";
            SLs.container.insertBefore(labelSuggestions, null);
        }
        SLs.container.style.borderWidth = "1px";
        SLs.container.style.zIndex = "10002";
        SLs.container.style.height = "auto";
        SLs.container.style.maxHeight = SLs.div_hoehe + 124 + "px";
        if (gFSuggestInstances[fieldIndex].field.value.length > 0) {
            this.addFurtherMatchesButton();
        }
        if (navigator.userAgent.toLowerCase().indexOf("msie") > -1) {
        }
        if (navigator.userAgent.toLowerCase().indexOf("msie") > -1 && navigator.userAgent.indexOf("7.0") < 0) {
            SLs.hideSelect();
        }
        if (SLs.sls.length < 1 && gFSuggestInstances[fieldIndex].useTopFavorites != true) {
            SLs.delete_SLs();
        }
    },
    delete_SLs: function (mode, force) {
        if (SLs.scrollChecker) {
            window.clearInterval(SLs.scrollChecker);
        }
        if (document.getElementById("tooltip") != null) {
            document.getElementById("tooltip").style.display = "none";
        }
        if (!blockHide) {
            if ((SLs.container) && (SLs.container.parentNode)) {
                if (typeof mode == "undefined" || mode == true) {
                    document.getElementsByTagName("body")[0].removeChild(SLs.container);
                    SLs.container = null;
                } else {
                    if ((typeof force != "undefined") && (force == true)) {
                        SLs.container.innerHTML = "";
                    }
                }
                if (navigator.userAgent.toLowerCase().indexOf("msie") > -1 && navigator.userAgent.indexOf("7.0") < 0) {
                    SLs.showSelect();
                }
                SLs.countList = -1;
                SLs.currentTop = 0;
                SLs.currentBottom = 9;
            }
            if (document.getElementById("overlayProducts")) {
                document.getElementById("overlayProducts").style.display = "none";
            }
            if (document.getElementById("geomap")) {
                SLs.hideGeoMap();
            }
            SLs.extendedSearch = true;
        }
    },
    checkUpdate: function (keycode) {
        var cached;
        if (!SLs.cachedSuggestions) {
            return true;
        } else {
            if (cached = SLs.laden(gFSuggestInstances[fieldIndex].field.value)) {
                SLs.sls.suggestions = cached;
                return false;
            } else {
                if (typeof SLs.sls.suggestions[0] != "undefined") {
                    var matches = SLs.checkForMatches("prefix", gFSuggestInstances[fieldIndex].field.value, SLs.sls.suggestions[0].value);
                    if (matches == false || (keycode == 8)) {
                        return true;
                    } else {
                        return false;
                    }
                } else {
                    return true;
                }
            }
        }
    },
    checkForMatches: function (type, userInput, sugg) {
        if (type == "prefix") {
            matchedWordStart = sugg.toString().toLowerCase().indexOf(userInput.toString().toLowerCase());
            if (matchedWordStart != 0) {
                return false;
            } else {
                return true;
            }
        } else {
            var inputTokens = new Array();
            var prefixMatch = false;
            inputTokens = userInput.split(" ");
            for (var j = 0; j < inputTokens.length; j++) {
                var matches = 0;
                var checkedWords = 0;
                if (inputTokens[j] != "" && inputTokens[j] != " ") {
                    matchedWordStart = sugg.toString().toLowerCase().indexOf(inputTokens[j].toLowerCase());
                    if (matchedWordStart == 0 && j == 0) {
                        prefixMatch = true;
                        matches++;
                    } else {
                        if (matchedWordStart != -1 && j > 0) {
                            matches++;
                        }
                    }
                    checkedWords++;
                }
            }
            if (matches == checkedWords && prefixMatch == true) {
                return true;
            } else {
                return false;
            }
        }
    },
    getPosX: function (a) {
        var b = 0;
        if (a.offsetParent) {
            var tempA = a;
            while ((tempA.parentNode) && (tempA.nodeName != "HTML")) {
                b -= tempA.scrollLeft;
                tempA = tempA.parentNode;
            }
            while (a.offsetParent) {
                b += a.offsetLeft;
                a = a.offsetParent;
            }
        } else {
            if (a.x) {
                b += a.x;
            }
        }
        return b;
    },
    getPosY: function (a) {
        var b = 0;
        if (a.offsetParent) {
            var tempA = a;
            while ((tempA.parentNode) && (tempA.nodeName != "HTML")) {
                b -= tempA.scrollTop;
                tempA = tempA.parentNode;
            }
            while (a.offsetParent) {
                b += a.offsetTop;
                a = a.offsetParent;
            }
        } else {
            if (a.y) {
                b += a.y;
            }
        }
        return b;
    },
    hideSelect: function () {
        var f = document.getElementsByTagName("select");
        for (var e = 0; e < f.length; e++) {
            var d = false;
            var c = false;
            var b = SLs.getPosX(f[e]);
            var a = SLs.getPosY(f[e]);
            if (SLs.pos_x <= b && b < SLs.pos_x + SLs.container.clientWidth) {
                d = true;
            } else {
                if (SLs.pos_x < b + f[e].clientWidth && b + f[e].clientWidth <= SLs.pos_x + SLs.container.clientWidth) {
                    d = true;
                } else {
                    if (SLs.pos_x > b && b + f[e].clientWidth > SLs.pos_x) {
                        d = true;
                    }
                }
            }
            if (SLs.pos_y < a && a < SLs.pos_y + SLs.container.clientHeight) {
                c = true;
            } else {
                if (SLs.pos_y < a + f[e].clientHeight && a + f[e].clientHeight < SLs.pos_y + SLs.container.clientHeight) {
                    c = true;
                }
            }
            if ((d) && (c)) {
                f[e].style.visibility = "hidden";
            }
        }
    },
    clearHTMLTags: function (str) {
        if (typeof str != "undefined") {
            str = str.replace(/<b>/g, "");
            str = str.replace(/<\/b>/g, "");
            str = str.replace(/<B>/g, "");
            str = str.replace(/<\/B>/g, "");
            return str;
        }
    },
    showSelect: function () {
        var b = document.getElementsByTagName("select");
        for (var a = 0; a < b.length; a++) {
            if (b[a].style.visibility == "hidden") {
                b[a].style.visibility = "visible";
            }
        }
    },
    replaceSpecialChars: function (str) {
        str = str.replace(/&#252;/, "ü");
        str = str.replace(/&#223;/, "ß");
        str = str.replace(/&#220;/, "Ü");
        str = str.replace(/&#228;/, "ä");
        str = str.replace(/&#196;/, "Ä");
        str = str.replace(/&#246;/, "ö");
        str = str.replace(/&#214;/, "Ö");
        return str;
    },
    getProducts: function () {
        var str = "";
        var products = new Array("ice_16x16.gif", "sbahn_16x16.gif", "ubahn_16x16.gif", "ec_ic_16x16.gif");
        a = 1 + (products.length - 1) * (Math.random());
        a = Math.round(a);
        if (typeof fsugg_products != "undefined") {
            str += fsugg_products;
        }
        return str;
    },
    classSelect: function (str, keyword) {
        if (str.length >= keyword.length) {
            return str.substr(0, str.length - keyword.length);
        } else {
            return str;
        }
    },
    createGeoBox: function () {
        var geomapid = "geomap";
        var mapcontid = "mapcontainer";
        effectDuration = 0.4;
        var mapContainer = document.getElementById(geomapid);
        if (!mapContainer) {
            mapContainer = document.createElement("div");
            mapContainer.style.position = "absolute";
            mapContainer.style.height = "307px";
            mapContainer.style.width = "300px";
            mapContainer.style.display = "block";
            mapContainer.style.overflow = "hidden";
            mapContainer.style.zIndex = "20000000";
            mapContainer.style.backgroundColor = "#F2F2F2";
            mapContainer.id = geomapid;
            mapContainer.style.left = SLs.getPosX(SLs.container) + parseInt(SLs.container.clientWidth) + 3 + "px";
            mapContainer.style.top = SLs.getPosY(SLs.container) + "px";
            mapContainer.onmouseover = function () {
                blockHide = true;
            };
            mapContainer.onmouseout = function () {
                blockHide = false;
            };
            document.getElementsByTagName("body")[0].appendChild(mapContainer);
            var mapTitle = document.createElement("div");
            mapTitle.style.height = "15px";
            mapTitle.style.width = "300px";
            mapTitle.style.backgroundColor = "#5D5D5D";
            mapTitle.style.color = "#fff";
            mapTitle.style.fontSize = "11px";
            mapTitle.id = "maptitle";
            mapContainer.appendChild(mapTitle);
            var mapArea = document.createElement("div");
            mapArea.style.height = "307px";
            mapArea.style.width = "300px";
            mapArea.id = mapcontid;
            mapContainer.appendChild(mapArea);
            geoMap = new CPTVMap(mapcontid, {
                mode: "simple",
                coord: new CCoord({latitude: 52520501, longitude: 13386987}),
                zoom: 1400
            });
            geoMap.show();
        }
        mapContainer.style.left = SLs.getPosX(SLs.container) + parseInt(SLs.container.clientWidth) + 3 + "px";
        mapContainer.style.top = SLs.getPosY(SLs.container) + "px";
        return mapContainer;
    },
    showGeoMap: function (coordx, coordy, ptitle) {
        var mapContainer = SLs.createGeoBox();
        var coordset = new CCoord({latitude: coordy, longitude: coordx});
        geoMap.centerToGeo(coordset);
        geoMap.setZoom(1400);
        if (SLs.currLocation != null) {
            geoMap.hideContent(SLs.currLocation);
            geoMap.removeContent(SLs.currLocation);
        }
        SLs.currLocation = geoMap.createContent({
            type: "location",
            coord: coordset,
            imageurl: gImagePath + "/icons/selected_location.png",
            imagewidth: 14,
            imageheight: 14,
            hotspot: {x: 7, y: 7}
        });
        geoMap.showContent(SLs.currLocation);
        document.getElementById("maptitle").innerHTML = "<b>&nbsp;" + ((typeof t_location != "undefined") ? t_location : "Location:") + ':</b>&nbsp;<span title="' + ptitle + '">' + ptitle + "</span>";
        if (SLs.container.scrollHeight > SLs.container.clientHeight) {
            var addwidth = 20;
        } else {
            var addwidth = 0;
        }
        mapContainer.style.left = (SLs.getPosX(SLs.container) + parseInt(SLs.container.clientWidth)) + addwidth + 3 + "px";
        mapContainer.style.top = SLs.getPosY(SLs.container) + "px";
        mapContainer.style.display = "block";
    },
    hideGeoMap: function () {
        document.getElementById("geomap").style.display = "none";
    },
    restoreOldZoom: function () {
        if (typeof geoMap != "undefined") {
            if (typeof SLs.lastZoom != "undefined") {
                geoMap.setZoom(SLs.lastZoom);
            } else {
                geoMap.setZoom(1400);
            }
            geoMap.hideContent(SLs.currLocation);
            geoMap.removeContent(SLs.currLocation);
        }
    },
    addLabel: function (label, id) {
        var labeldiv = document.createElement("li");
        labeldiv.innerHTML = label;
        labeldiv.className = "infoLabel";
        labeldiv.id = id;
        labeldiv.style.textAlign = "right";
        SLs.container.appendChild(labeldiv);
    },
    getProductIcon: function (prodclass, name) {
        var actObj = this;
        if (typeof product_icons != "undefined") {
            if (typeof productNamesCustomer == "undefined") {
                var productNames = new Array("ICE", "IC/EC", "IR/D", "IRE/RE/RB", "S-Bahn", "Bus", "Schiff", "U-Bahn", "Bahn", "Taxi");
            } else {
                var productNames = productNamesCustomer;
            }
            if (prodclass != "0") {
                var num = parseInt(prodclass);
                var bits = num.toString(2);
                var pclass = -1;
                var j = 0;
                var title = "";
                for (var i = bits.length; i >= 0; i--) {
                    if (bits.charAt(i) == "1") {
                        if (j <= pclass || pclass == -1) {
                            pclass = j;
                        }
                        title += productNames[j - 1] + " ";
                    }
                    j++;
                }
                var imageProduct = document.createElement("img");
                imageProduct.style.height = "14px";
                imageProduct.style.width = "14px";
                imageProduct.src = product_icons[pclass - 1];
                imageProduct.onmousemove = function (evt) {
                    if (typeof evt == "undefined" && window.event != null) {
                        evt = window.event;
                    }
                    SLs.createTooltip(evt, title, name, bits);
                };
                imageProduct.onmouseout = function (evt) {
                    document.getElementById("tooltip").style.opacity = "0";
                };
                imageProduct.onmouseover = function (evt) {
                    if (document.getElementById("tooltip") == null) {
                        actObj.makeTooltip();
                    }
                    document.getElementById("tooltip").style.opacity = "0";
                    SLs.fadeIn("tooltip");
                };
                return imageProduct;
            } else {
                return '<img src="" height="14" width="14"/>';
            }
        }
        return "";
    },
    getWeightIcon: function (weight) {
        var image = "";
        if (weight < 200) {
            image = "icons/icon_weight_01.gif";
        } else {
            if (weight >= 200 && weight < 5000) {
                image = "icons/icon_weight_03.gif";
            } else {
                if (weight >= 5000 && weight < 10000) {
                    image = "icons/icon_weight_05.gif";
                } else {
                    if (weight >= 10000 && weight < 15000) {
                        image = "icons/icon_weight_07.gif";
                    } else {
                        image = "icons/icon_weight_08.gif";
                    }
                }
            }
        }
        return '<img style="vertical-align:middle;" title="' + weight + " " + ((typeof t_connectionsPerYear != "undefined") ? t_connectionsPerYear : "rides per year") + '" src="' + gImagePath + image + '" height="14" width="14"/>';
    },
    createTooltip: function (evt, title, name, bits) {
        if (document.getElementById("tooltip") == null) {
            this.makeTooltip();
        }
        if (typeof productNamesCustomer == "undefined") {
            var productNames = new Array("ICE", "IC/EC", "IR/D", "IRE/RE/RB", "S-Bahn", "Bus", "Schiff", "U-Bahn", "Bahn", "Taxi");
        } else {
            var productNames = productNamesCustomer;
        }
        document.getElementById("tooltip").style.left = evt.clientX + 18 + "px";
        document.getElementById("tooltip").style.top = evt.clientY + "px";
        var content = "";
        for (var i = bits.length; i >= 0; i--) {
            if (bits.charAt(i) == "1") {
                content += '<li style="text-align:center;width:60px;list-style-type:none;float:left"><img src="' + product_icons[bits.length - i - 1] + '"/><br/>' + productNames[bits.length - i - 1] + "</li>";
            }
        }
        document.getElementById("tooltip").innerHTML = ((typeof t_meansOfTransport != "undefined") ? t_meansOfTransport : "means of transport") + " <b>" + name + '</b>:<br/><ul style="margin-left:-40px;">' + content + "</ul>";
    },
    makeTooltip: function () {
        var tooltip = document.body.appendChild(document.createElement("div"));
        tooltip.style.width = "auto";
        tooltip.id = "tooltip";
        tooltip.style.height = "auto";
        tooltip.style.position = "absolute";
        tooltip.style.zIndex = "2000000";
        tooltip.style.background = "#efefef";
        tooltip.style.border = "1px solid #333333";
        tooltip.style.padding = "3px";
        tooltip.className = "greyBox";
        tooltip.style.display = "none";
        tooltip.style.opacity = "0";
    },
    fadeIn: function (elemid) {
        elem = document.getElementById(elemid);
        elem.style.display = "block";
        elem.style.opacity = "1.0";
        var oldOpac = parseFloat(elem.style.opacity) * 100;
        var opac = oldOpac + 4;
        if (opac > 100) {
            opac = 100;
        }
        elem.style.opacity = (opac / 100);
        elem.style.filters = "Alpha(opacity=" + opac + ")";
        if (opac < 100) {
            window.setTimeout("SLs.fadeIn('" + elemid + "');", 20);
        }
    },
    fadeOut: function (elemid) {
        elem = document.getElementById(elemid);
        var oldOpac = parseFloat(elem.style.opacity) * 100;
        var opac = oldOpac - 4;
        if (opac < 0) {
            opac = 0;
        }
        elem.style.opacity = (opac / 100);
        elem.style.filters = "Alpha(opacity=" + opac + ")";
        if (opac > 0) {
            window.setTimeout("SLs.fadeOut('" + elemid + "');", 20);
        } else {
            elem.style.display = "none";
        }
    },
    selPerimParams: function (checkbox) {
        if (checkbox.checked) {
            var param = "selectPerimeterFilter;";
            param += Map.getCenter().lon + ";";
            param += Map.getCenter().lat + ";";
            var zoom = Map.getZoom();
            zoom = Math.round(zoom / 2000);
            if (zoom == 0) {
                zoom = 1;
            }
            param += zoom + ";";
            checkbox.value = param;
            this.selectPerimeterFilterParam = checkbox.name + "=" + param;
        } else {
            this.selectPerimeterFilterParam = "";
        }
    }
};