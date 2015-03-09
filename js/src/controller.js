function hasSVG() {
    document.documentElement.className = document.documentElement.className.replace(/\bno-svg\b/gi, "svg")
}

function detectSVG() {
    var e = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNzUiIGhlaWdodD0iMjc1Ij48L3N2Zz4%3D",
        t = document.createElement("img");
    t.setAttribute("src", e), t.onload = hasSVG, document.documentElement.className += " no-svg"
}

function appCtrl() {}

function GameCtrl(e, t, n, r, i, o, a, s) {
    e.statusBarTitle = "Kahoot!", i.reset(), i.preloadAssets(), e.notStandalone = function() {
        return !o.navigator.standalone
    }, e.joinSession = function(r) {
        function o() {
            e.$broadcast("clearWait"), e.$broadcast("dismissAlert", {
                key: "handshakeFailure"
            }), n.path("/join"), e.$$phase || e.$apply()
        }

        function c(t) {
            e.gameId = t, i.connect(e.gameId)
        }

        function l(t) {
            e.$broadcast("clearWait"), e.$broadcast("badGameId"), e.$broadcast("alert", {
                key: "invalidGameId",
                message: e.siteAppContent.errors[t],
                alertType: "error",
                autoDismiss: !0,
                userDismissable: !0
            })
        }
        e.$broadcast("dismissAlert", {
            key: "blankGameId"
        }), e.$broadcast("dismissAlert", {
            key: "invalidGameId"
        }), t.$on("handshakeFailure", function() {
            e.$broadcast("clearWait"), e.$broadcast("alert", {
                key: "handshakeFailure",
                message: e.siteAppContent.errors["quiz-connection"],
                alertType: "error",
                autoDismiss: !1,
                userDismissable: !1
            })
        }), t.$on("handshakeSuccess", o), "string" == typeof r && (r = r.replace(/^\s+|\s+$/g, "")), r ? (e.$broadcast("busy"), a.session.api ? (r = r.replace(/[^0-9]+/g, ""), r = 1 * r, e.$broadcast("wait", {
            message: e.siteAppContent.info["connecting-to-server"]
        }), s.exists(r, function(t, n) {
            t ? c(r) : (l(200 == n ? "quiz-pin-invalid" : 503 == n ? "quiz-pin-rate-limited" : "quiz-pin-general"), e.$broadcast("free"))
        })) : 1 * r == 1 ? (e.$broadcast("wait", {
            message: e.siteAppContent.info["connecting-to-server"]
        }), c(r)) : (l(), e.$broadcast("free"))) : (e.$broadcast("badGameId"), e.$broadcast("alert", {
            key: "blankGameId",
            message: e.siteAppContent.errors["quiz-pin-non-entry"],
            alertType: "error",
            autoDismiss: !0,
            userDismissable: !0
        }))
    }
}

function JoinCtrl(e, t, n, r) {
    return void 0 === e.gameId ? void t.path("/") : (e.statusBarTitle = e.siteAppContent.info["game-pin"] + e.gameId, e.user = e.user || {}, e.$on("userNameCleaned", function(t, n) {
        e.user.cleanName = n, e.$broadcast("free")
    }), void(e.join = function(t) {
        t.name && t.name.length > 0 ? (e.$broadcast("busy"), e.$broadcast("wait", {
            message: e.siteAppContent.info["checking-nickname"]
        }), e.user = angular.copy(t), r.join(e.user.name), e.$broadcast("dismissAlert", {
            key: "blanknickname"
        }), e.$broadcast("dismissAlert", {
            key: "kicked-general"
        })) : (e.$broadcast("badUsername"), e.$broadcast("alert", {
            key: "blanknickname",
            message: e.siteAppContent.errors["quiz-nickname-non-entry"],
            alertType: "error",
            autoDismiss: !0,
            userDismissable: !0
        }))
    }))
}

function InstructionsCtrl(e, t, n, r) {
    r.ensureConnection() || (t.totalScore = "undefined" != typeof t.totalScore ? t.totalScore : 0, t.qIdx = "undefined" != typeof t.qIdx ? t.qIdx : 0, e.statusBarTitle = e.siteAppContent.info["game-pin"] + e.gameId, e.scoreClass = function() {
        return "hide"
    })
}

function StartCtrl(e, t, n, r, i) {
    if (!n.ensureConnection()) {
        if (e.totalScore = 0, e.qIdx = 0, !e.quizType) return void i.path("/instructions");
        t.statusBarTitle = t.siteAppContent.info["game-pin"] + t.gameId, t.scoreClass = function() {
            return r.quizTypes[e.quizType].showScore ? "score" : "hide"
        }
    }
}

function GetReadyCtrl(e, t, n, r, i, o) {
    if (!i.ensureConnection()) {
        var a = 5,
            s = 1e3;
        if (e.introTimer = n.registerCountdown("introTimer", a - 1, s), e.introMessages = ["Go!", "Steady&hellip;", "Ready&hellip;"], e.introMessage = e.introMessages[e.introMessages.length - 1], e.counter = a, !t.quizType) return void r.path("/instructions");
        e.statusBarTitle = e.siteAppContent.info["game-pin"] + e.gameId, e.playerRank = i.getPlayerRank(), e.introMessage = function() {
            var t = e.introTimer.counter > e.introMessages.length - 1 ? e.introMessages.length - 1 : e.introTimer.counter;
            return e.introMessages[t]
        }, e.questionNumber = function(e) {
            return o.quizTypes[t.quizType].showQuestionNumbers ? e + "" + (t.qIdx + 1) : ""
        }, e.$on("countdown", function(t, n) {
            "introTimer" === n.id && (e.counter = n.timeLeft + 1)
        }), e.$on("countdownStopped", function(e, t) {
            "introTimer" === t.id && r.path("/answer")
        }), e.scoreClass = function() {
            return o.quizTypes[t.quizType].showScore ? "score" : "hide"
        }, e.introTimer.start()
    }
}

function AnswerCtrl(e, t, n, r, i, o, a, s, c) {
    if (!i.ensureConnection()) {
        if (!t.quizType) return void s.path("/instructions");
        var l = !1;
        "quiz" === t.quizType && (l = !0), e.uiEnabled = !0, e.statusMessage = "", e.selectedAnswer = null, e.choices = ["A", "B", "C", "D"], e.playerRank = i.getPlayerRank(), l && (e.revealAnswerFeedback = !1, e.revealAnswerFeedbackPromise = null, e.primaryFeedbackMessage = null), e.statusBarTitle = e.siteAppContent.info["game-pin"] + e.gameId, e.questionNumber = function(e) {
            return a.quizTypes[t.quizType].showQuestionNumbers ? e + "" + (t.qIdx + 1) : ""
        }, e.quizQuestionAnswers = t.quizQuestionAnswers[t.qIdx], e.showAnswer = function(t) {
            return t + 1 > e.quizQuestionAnswers ? !1 : !0
        }, e.selectAnswer = function(n) {
            e.uiEnabled && (r.log("Selected answer: " + n), e.uiEnabled = !1, e.selectedAnswer = n, e.statusMessage = t.siteAppContent.info["waiting-other-answers"], e.$$phase || e.$apply(), i.selectAnswer(n))
        }, e.scoreClass = function() {
            return a.quizTypes[t.quizType].showScore ? "score" : "hide"
        }, e.messageClass = function() {
            var t = "";
            return e.revealAnswerFeedback || null == e.selectedAnswer && !e.timeUp || (t += " show"), t += e.revealAnswer ? e.revealAnswer && e.correct ? " correct" : " incorrect" : " answer" + e.choices[e.selectedAnswer]
        }, e.statusMessageClass = function() {
            return e.revealAnswer ? "" : "waiting"
        }, e.resultClass = function() {
            return e.revealAnswer ? "" : "hide"
        }, e.isSelectedAnswer = function(t) {
            return t == e.selectedAnswer
        }, e.answerFeedbackClass = function() {
            return e.revealAnswerFeedback ? "" : "hide"
        }, e.answerButtonsClass = function() {
            var t = "";
            return (e.revealAnswer || null != e.selectedAnswer || e.timeUp) && (t += "hidden"), t
        }, e.animatedBackgroundClass = function() {
            return e.revealAnswerFeedback ? "animated-background animated-background--fast" : ""
        }, e.selectedAnswerClass = function() {
            var t = "";
            return e.selectedAnswer >= 0 && (t = "answer" + e.choices[e.selectedAnswer]), e.revealAnswer && (t += " hidden"), t
        }, e.selectedAnswerLabel = function() {
            return e.choices[e.selectedAnswer]
        }, e.resultIcon = function() {
            return e.correct ? "correct" : "incorrect"
        }, e.$on("timeUp", function() {
            null === e.selectedAnswer && (e.timeUp = !0, e.uiEnabled = !1, e.$$phase || e.$apply())
        }), e.$on("answerResponse", function(t, r) {
            !e.revealAnswer && l && (e.revealAnswerFeedbackPromise = n(function() {
                e.revealAnswerFeedback = !0, e.primaryFeedbackMessage = r.primaryMessage
            }, s.search().prototype_displayAnswerDuration || 250))
        }), e.$on("revealAnswer", function(r, s) {
            var u = "";
            if (e.revealAnswer = !0, l && (e.revealAnswerFeedbackPromise && n.cancel(e.revealAnswerFeedbackPromise), e.revealAnswerFeedback = !1), e.playerRank = i.setPlayerRank(s.rank + "<sup>" + i.ordinal(s.rank) + "</sup>"), s.isCorrect ? (e.correct = !0, e.resultMessage = "Correct!", u = s.points + " Kahoots for you.") : (e.correct = !1, e.resultMessage = e.timeUp ? "Time Up!" : "Incorrect!", o.each(s.correctAnswers, function(e, t) {
                t > 0 && (u += ", "), u += '<span class="correctAnswer richText">' + c.removeDangerousTags(e) + "</span>"
            }), u += (s.correctAnswers.length > 1 ? " were" : " was") + " correct."), u += '<br>You&rsquo;re now in <span class="correctAnswer">' + e.playerRank + "</span> position.", s.nemesis) {
                var d = s.nemesis.totalScore - s.totalScore;
                u += 0 == d ? '<br>You\'re tied with <span class="correctAnswer">' + c.removeDangerousTags(s.nemesis.name) + "</span>!" : '<br>Only <span class="correctAnswer">' + d + '</span> behind <span class="correctAnswer">' + c.removeDangerousTags(s.nemesis.name) + "</span>!"
            }
            e.statusMessage = a.quizTypes[t.quizType].showScore ? u : "", a.quizTypes[t.quizType].showScore || (u = '<span class="correctAnswer richText">You selected \'' + (c.removeDangerousTags(s.text) || "") + "'</span>", e.resultMessage = e.timeUp ? "Time Up!" : u, t.lastAnswer = c.removeDangerousTags(s.text) || ""), e.points = s.points, t.totalScore = s.totalScore, e.$$phase || e.$apply()
        })
    }
}

function RankingCtrl(e, t, n, r, i) {
    if (!r.ensureConnection()) {
        if (!t.quizType) return void n.path("/instructions");
        e.primaryMessage = t.primaryRankingMessage, e.secondaryMessage = t.secondaryRankingMessage, e.statusBarTitle = "Game over", e.playerRank = r.getPlayerRank(), e.scoreClass = function() {
            return i.quizTypes[t.quizType].showScore ? "score" : "hide"
        }
    }
}

function FeedbackCtrl(e, t, n, r, i, o, a) {
    r.ensureConnection() || (e.statusBarTitle = "Rate this ", e.statusBarTitle = e.siteAppContent.info["game-pin"] + e.gameId, e.feedback = {}, e.feedback.totalScore = t.totalScore, e.submitted = !1, e.playerRank = r.getPlayerRank(), e.feedbackResponse = function() {
        var t = {};
        switch (e.feedback.overall) {
            case 0:
                t.title = e.siteAppContent.feedback.meh.title, t.text = e.siteAppContent.feedback.meh.text;
                break;
            case -1:
                t.title = e.siteAppContent.feedback.frown.title, t.text = e.siteAppContent.feedback.frown.text;
                break;
            case 1:
                t.title = e.siteAppContent.feedback.smile.title, t.text = e.siteAppContent.feedback.smile.text
        }
        return t
    }, e.feeling = function() {
        var t = "";
        switch (e.feedback.overall) {
            case 0:
                t = "indifferent";
                break;
            case -1:
                t = "sad";
                break;
            case 1:
                t = "happy"
        }
        return t
    }, e.scoreClass = function() {
        return o.quizTypes[t.quizType].showScore ? "score" : "hide"
    }, e.meh = function() {
        e.feedback.overall = 0, e.submitFeedback()
    }, e.frown = function() {
        e.feedback.overall = -1, e.submitFeedback()
    }, e.smile = function() {
        e.feedback.overall = 1, e.submitFeedback()
    }, e.submitFeedback = function() {
        e.submitted = !0, e.feedback.nickname = e.user.cleanName, e.feedback.fun && (e.feedback.fun = 1 * e.feedback.fun), e.feedback.learning && (e.feedback.learning = 1 * e.feedback.learning), e.feedback.recommend && (e.feedback.recommend = 1 * e.feedback.recommend), e.feedback.overall && (e.feedback.overall = 1 * e.feedback.overall), r.submitFeedback(e.feedback), a(function() {
            i.path("/gameover")
        }, 3e3)
    }, e.done = function() {
        return e.submitted
    })
}

function GameOverCtrl(e, t, n, r, i, o, a, s) {
    function c() {
        var t = {};
        return 1 == e.result.rank ? (t.winner = !0, t.position = "I won") : (t.winner = !1, t.position = "I finished " + e.result.rank + n.ordinal(e.result.rank)), t.score = e.result.totalScore + " Kahoots", t.kahoots = e.result.totalScore, t.quiz = e.quizName, t.quizurl = i.player.baseUrl + "/#/k/" + e.result.quizId, t
    }

    function l() {
        var t = {};
        return t.quizurl = i.player.baseUrl + "/#/k/" + e.result.quizId, t.text = "I answered '" + e.lastAnswer + "' in the @GetKahoot discussion " + e.quizName + " " + t.quizurl, t
    }

    function u(e) {
        return $.ajax({
            type: "POST",
            url: "https://www.googleapis.com/urlshortener/v1/url?key=AIzaSyBm3PtKPSKP5YPKvX4hQ4lnhxDfgvULJuI",
            dataType: "json",
            contentType: "application/json",
            crossDomain: !0,
            async: !1,
            data: angular.toJson({
                longUrl: e
            })
        })
    }
    if (!n.ensureConnection()) {
        if (!e.quizType) return void a.path("/instructions");
        t.shareWhat = o.quizTypes[e.quizType].showTitle ? "score" : "opinion", t.statusBarTitle = t.siteAppContent.info["game-pin"] + t.gameId, t.resultMessage = function() {
            return o.quizTypes[e.quizType].showScore ? '<span class="correctAnswer game-over-small">Game Over!</span> You finished <span class="correctAnswer">' + e.result.rank + n.ordinal(e.result.rank) + '</span> with <span class="correctAnswer">' + e.result.totalScore + "</span> Kahoots" : ""
        }, t.resultsListClass = function() {
            return o.quizTypes[e.quizType].showScore ? "" : "hide"
        }, t.shareSocialClass = function() {
            return o.quizTypes[e.quizType].showSocial ? "sharesocial" : "hide"
        }, t.gameoverTitle = function() {
            return o.quizTypes[e.quizType].showScore ? "Game over" : t.siteAppContent.contentTypes[e.quizType] + " over!"
        }, t.gameOverClass = function() {
            return 1 == e.result.rank ? "winner" : ""
        }, t.scoreClass = function() {
            return o.quizTypes[e.quizType].showScore ? "score" : "hide"
        }, t.shareFacebook = function() {
            var n = document.location.pathname + document.location.search + document.location.hash;
            if (r._gaq && _gaq.push(["_trackSocial", "facebook", "share", e.result.quizId, n]), r.ga && ga("send", "social", "facebook", "share", e.result.quizId, {
                page: n
            }), o.quizTypes[e.quizType].showScore) {
                var a = c(),
                    u = a.position;
                u += a.winner ? " the Kahoot! quiz '" + a.quiz + "'" : " in the Kahoot! quiz '" + a.quiz + "'", u += " out of " + e.result.playerCount + " players", s(function() {
                    r.location.href = "https://www.facebook.com/dialog/feed?app_id=" + i.facebook.appid + "&link=" + encodeURIComponent(a.quizurl) + "&picture=https://getkahoot.com/img/kahoot-facebook-play-image.png&name=" + encodeURIComponent(u) + "&caption=" + encodeURIComponent("With " + a.score + "!") + "&description=" + encodeURIComponent(t.siteAppContent.info["facebook-desc"]) + "&redirect_uri=" + encodeURIComponent(i.controller.baseUrl + "/#/instructions")
                }, 100)
            } else {
                var a = l(),
                    u = a.text;
                s(function() {
                    r.location.href = "https://www.facebook.com/dialog/feed?app_id=" + i.facebook.appid + "&link=" + encodeURIComponent(a.quizurl) + "&picture=https://getkahoot.com/img/kahoot-facebook-play-image.png&name=" + encodeURIComponent(u) + "&description=" + encodeURIComponent(t.siteAppContent.info["facebook-desc"]) + "&redirect_uri=" + encodeURIComponent(i.controller.baseUrl + "/#/instructions")
                }, 100)
            }
        }, t.shareTwitter = function() {
            if (o.quizTypes[e.quizType].showScore) {
                var t = c(),
                    n = t.position;
                n += t.winner ? " the" : " in the", n += " @GetKahoot quiz '";
                var i = "' out of " + e.result.playerCount + " players, with " + t.kahoots + " #Kahoots!",
                    a = document.location.pathname + document.location.search + document.location.hash;
                r._gaq && _gaq.push(["_trackSocial", "twitter", "share", e.result.quizId, a]), r.ga && ga("send", "social", "twitter", "share", e.result.quizId, {
                    page: a
                });
                var d = new $.Deferred;
                u(t.quizurl).done(function(e) {
                    d.resolve(e.id)
                }).fail(function() {
                    d.resolve(t.quizurl)
                }), d.done(function(e) {
                    var o = n + t.quiz.substr(0, 140 - n.length - i.length) + i + " " + e;
                    s(function() {
                        r.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(o), "_blank")
                    }, 100)
                })
            } else {
                var t = l(),
                    f = t.text;
                s(function() {
                    r.open("https://twitter.com/intent/tweet?text=" + encodeURIComponent(f), "_blank")
                }, 100)
            }
        }
    }
}! function(e, t) {
    function n(e) {
        var t, n, r = D[e] = {};
        for (e = e.split(/\s+/), t = 0, n = e.length; n > t; t++) r[e[t]] = !0;
        return r
    }

    function r(e, n, r) {
        if (r === t && 1 === e.nodeType) {
            var i = "data-" + n.replace(F, "-$1").toLowerCase();
            if (r = e.getAttribute(i), "string" == typeof r) {
                try {
                    r = "true" === r ? !0 : "false" === r ? !1 : "null" === r ? null : I.isNumeric(r) ? +r : P.test(r) ? I.parseJSON(r) : r
                } catch (o) {}
                I.data(e, n, r)
            } else r = t
        }
        return r
    }

    function i(e) {
        for (var t in e)
            if (("data" !== t || !I.isEmptyObject(e[t])) && "toJSON" !== t) return !1;
        return !0
    }

    function o(e, t, n) {
        var r = t + "defer",
            i = t + "queue",
            o = t + "mark",
            a = I._data(e, r);
        !a || "queue" !== n && I._data(e, i) || "mark" !== n && I._data(e, o) || setTimeout(function() {
            I._data(e, i) || I._data(e, o) || (I.removeData(e, r, !0), a.fire())
        }, 0)
    }

    function a() {
        return !1
    }

    function s() {
        return !0
    }

    function c(e) {
        return !e || !e.parentNode || 11 === e.parentNode.nodeType
    }

    function l(e, t, n) {
        if (t = t || 0, I.isFunction(t)) return I.grep(e, function(e, r) {
            var i = !! t.call(e, r, e);
            return i === n
        });
        if (t.nodeType) return I.grep(e, function(e) {
            return e === t === n
        });
        if ("string" == typeof t) {
            var r = I.grep(e, function(e) {
                return 1 === e.nodeType
            });
            if (ut.test(t)) return I.filter(t, r, !n);
            t = I.filter(t, r)
        }
        return I.grep(e, function(e) {
            return I.inArray(e, t) >= 0 === n
        })
    }

    function u(e) {
        var t = ht.split("|"),
            n = e.createDocumentFragment();
        if (n.createElement)
            for (; t.length;) n.createElement(t.pop());
        return n
    }

    function d(e) {
        return I.nodeName(e, "table") ? e.getElementsByTagName("tbody")[0] || e.appendChild(e.ownerDocument.createElement("tbody")) : e
    }

    function f(e, t) {
        if (1 === t.nodeType && I.hasData(e)) {
            var n, r, i, o = I._data(e),
                a = I._data(t, o),
                s = o.events;
            if (s) {
                delete a.handle, a.events = {};
                for (n in s)
                    for (r = 0, i = s[n].length; i > r; r++) I.event.add(t, n, s[n][r])
            }
            a.data && (a.data = I.extend({}, a.data))
        }
    }

    function p(e, t) {
        var n;
        1 === t.nodeType && (t.clearAttributes && t.clearAttributes(), t.mergeAttributes && t.mergeAttributes(e), n = t.nodeName.toLowerCase(), "object" === n ? t.outerHTML = e.outerHTML : "input" !== n || "checkbox" !== e.type && "radio" !== e.type ? "option" === n ? t.selected = e.defaultSelected : "input" === n || "textarea" === n ? t.defaultValue = e.defaultValue : "script" === n && t.text !== e.text && (t.text = e.text) : (e.checked && (t.defaultChecked = t.checked = e.checked), t.value !== e.value && (t.value = e.value)), t.removeAttribute(I.expando), t.removeAttribute("_submit_attached"), t.removeAttribute("_change_attached"))
    }

    function h(e) {
        return "undefined" != typeof e.getElementsByTagName ? e.getElementsByTagName("*") : "undefined" != typeof e.querySelectorAll ? e.querySelectorAll("*") : []
    }

    function g(e) {
        ("checkbox" === e.type || "radio" === e.type) && (e.defaultChecked = e.checked)
    }

    function m(e) {
        var t = (e.nodeName || "").toLowerCase();
        "input" === t ? g(e) : "script" !== t && "undefined" != typeof e.getElementsByTagName && I.grep(e.getElementsByTagName("input"), g)
    }

    function v(e) {
        var t = q.createElement("div");
        return Et.appendChild(t), t.innerHTML = e.outerHTML, t.firstChild
    }

    function y(e, t, n) {
        var r = "width" === t ? e.offsetWidth : e.offsetHeight,
            i = "width" === t ? 1 : 0,
            o = 4;
        if (r > 0) {
            if ("border" !== n)
                for (; o > i; i += 2) n || (r -= parseFloat(I.css(e, "padding" + Rt[i])) || 0), "margin" === n ? r += parseFloat(I.css(e, n + Rt[i])) || 0 : r -= parseFloat(I.css(e, "border" + Rt[i] + "Width")) || 0;
            return r + "px"
        }
        if (r = Nt(e, t), (0 > r || null == r) && (r = e.style[t]), Dt.test(r)) return r;
        if (r = parseFloat(r) || 0, n)
            for (; o > i; i += 2) r += parseFloat(I.css(e, "padding" + Rt[i])) || 0, "padding" !== n && (r += parseFloat(I.css(e, "border" + Rt[i] + "Width")) || 0), "margin" === n && (r += parseFloat(I.css(e, n + Rt[i])) || 0);
        return r + "px"
    }

    function b(e) {
        return function(t, n) {
            if ("string" != typeof t && (n = t, t = "*"), I.isFunction(n))
                for (var r, i, o, a = t.toLowerCase().split(tn), s = 0, c = a.length; c > s; s++) r = a[s], o = /^\+/.test(r), o && (r = r.substr(1) || "*"), i = e[r] = e[r] || [], i[o ? "unshift" : "push"](n)
        }
    }

    function $(e, n, r, i, o, a) {
        o = o || n.dataTypes[0], a = a || {}, a[o] = !0;
        for (var s, c = e[o], l = 0, u = c ? c.length : 0, d = e === an; u > l && (d || !s); l++) s = c[l](n, r, i), "string" == typeof s && (!d || a[s] ? s = t : (n.dataTypes.unshift(s), s = $(e, n, r, i, s, a)));
        return !d && s || a["*"] || (s = $(e, n, r, i, "*", a)), s
    }

    function w(e, n) {
        var r, i, o = I.ajaxSettings.flatOptions || {};
        for (r in n) n[r] !== t && ((o[r] ? e : i || (i = {}))[r] = n[r]);
        i && I.extend(!0, e, i)
    }

    function k(e, t, n, r) {
        if (I.isArray(t)) I.each(t, function(t, i) {
            n || Ut.test(e) ? r(e, i) : k(e + "[" + ("object" == typeof i ? t : "") + "]", i, n, r)
        });
        else if (n || "object" !== I.type(t)) r(e, t);
        else
            for (var i in t) k(e + "[" + i + "]", t[i], n, r)
    }

    function x(e, n, r) {
        var i, o, a, s, c = e.contents,
            l = e.dataTypes,
            u = e.responseFields;
        for (o in u) o in r && (n[u[o]] = r[o]);
        for (;
            "*" === l[0];) l.shift(), i === t && (i = e.mimeType || n.getResponseHeader("content-type"));
        if (i)
            for (o in c)
                if (c[o] && c[o].test(i)) {
                    l.unshift(o);
                    break
                }
        if (l[0] in r) a = l[0];
        else {
            for (o in r) {
                if (!l[0] || e.converters[o + " " + l[0]]) {
                    a = o;
                    break
                }
                s || (s = o)
            }
            a = a || s
        }
        return a ? (a !== l[0] && l.unshift(a), r[a]) : void 0
    }

    function T(e, n) {
        e.dataFilter && (n = e.dataFilter(n, e.dataType));
        var r, i, o, a, s, c, l, u, d = e.dataTypes,
            f = {}, p = d.length,
            h = d[0];
        for (r = 1; p > r; r++) {
            if (1 === r)
                for (i in e.converters) "string" == typeof i && (f[i.toLowerCase()] = e.converters[i]);
            if (a = h, h = d[r], "*" === h) h = a;
            else if ("*" !== a && a !== h) {
                if (s = a + " " + h, c = f[s] || f["* " + h], !c) {
                    u = t;
                    for (l in f)
                        if (o = l.split(" "), (o[0] === a || "*" === o[0]) && (u = f[o[1] + " " + h])) {
                            l = f[l], l === !0 ? c = u : u === !0 && (c = l);
                            break
                        }
                }
                c || u || I.error("No conversion from " + s.replace(" ", " to ")), c !== !0 && (n = c ? c(n) : u(l(n)))
            }
        }
        return n
    }

    function C() {
        try {
            return new e.XMLHttpRequest
        } catch (t) {}
    }

    function S() {
        try {
            return new e.ActiveXObject("Microsoft.XMLHTTP")
        } catch (t) {}
    }

    function A() {
        return setTimeout(E, 0), yn = I.now()
    }

    function E() {
        yn = t
    }

    function N(e, t) {
        var n = {};
        return I.each(kn.concat.apply([], kn.slice(0, t)), function() {
            n[this] = e
        }), n
    }

    function j(e) {
        if (!bn[e]) {
            var t = q.body,
                n = I("<" + e + ">").appendTo(t),
                r = n.css("display");
            n.remove(), ("none" === r || "" === r) && (gn || (gn = q.createElement("iframe"), gn.frameBorder = gn.width = gn.height = 0), t.appendChild(gn), mn && gn.createElement || (mn = (gn.contentWindow || gn.contentDocument).document, mn.write((I.support.boxModel ? "<!doctype html>" : "") + "<html><body>"), mn.close()), n = mn.createElement(e), mn.body.appendChild(n), r = I.css(n, "display"), t.removeChild(gn)), bn[e] = r
        }
        return bn[e]
    }

    function _(e) {
        return I.isWindow(e) ? e : 9 === e.nodeType ? e.defaultView || e.parentWindow : !1
    }
    var q = e.document,
        M = e.navigator,
        O = e.location,
        I = function() {
            function n() {
                if (!s.isReady) {
                    try {
                        q.documentElement.doScroll("left")
                    } catch (e) {
                        return void setTimeout(n, 1)
                    }
                    s.ready()
                }
            }
            var r, i, o, a, s = function(e, t) {
                    return new s.fn.init(e, t, r)
                }, c = e.jQuery,
                l = e.$,
                u = /^(?:[^#<]*(<[\w\W]+>)[^>]*$|#([\w\-]*)$)/,
                d = /\S/,
                f = /^\s+/,
                p = /\s+$/,
                h = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,
                g = /^[\],:{}\s]*$/,
                m = /\\(?:["\\\/bfnrt]|u[0-9a-fA-F]{4})/g,
                v = /"[^"\\\n\r]*"|true|false|null|-?\d+(?:\.\d*)?(?:[eE][+\-]?\d+)?/g,
                y = /(?:^|:|,)(?:\s*\[)+/g,
                b = /(webkit)[ \/]([\w.]+)/,
                $ = /(opera)(?:.*version)?[ \/]([\w.]+)/,
                w = /(msie) ([\w.]+)/,
                k = /(mozilla)(?:.*? rv:([\w.]+))?/,
                x = /-([a-z]|[0-9])/gi,
                T = /^-ms-/,
                C = function(e, t) {
                    return (t + "").toUpperCase()
                }, S = M.userAgent,
                A = Object.prototype.toString,
                E = Object.prototype.hasOwnProperty,
                N = Array.prototype.push,
                j = Array.prototype.slice,
                _ = String.prototype.trim,
                O = Array.prototype.indexOf,
                I = {};
            return s.fn = s.prototype = {
                constructor: s,
                init: function(e, n, r) {
                    var i, o, a, c;
                    if (!e) return this;
                    if (e.nodeType) return this.context = this[0] = e, this.length = 1, this;
                    if ("body" === e && !n && q.body) return this.context = q, this[0] = q.body, this.selector = e, this.length = 1, this;
                    if ("string" == typeof e) {
                        if (i = "<" === e.charAt(0) && ">" === e.charAt(e.length - 1) && e.length >= 3 ? [null, e, null] : u.exec(e), !i || !i[1] && n) return !n || n.jquery ? (n || r).find(e) : this.constructor(n).find(e);
                        if (i[1]) return n = n instanceof s ? n[0] : n, c = n ? n.ownerDocument || n : q, a = h.exec(e), a ? s.isPlainObject(n) ? (e = [q.createElement(a[1])], s.fn.attr.call(e, n, !0)) : e = [c.createElement(a[1])] : (a = s.buildFragment([i[1]], [c]), e = (a.cacheable ? s.clone(a.fragment) : a.fragment).childNodes), s.merge(this, e);
                        if (o = q.getElementById(i[2]), o && o.parentNode) {
                            if (o.id !== i[2]) return r.find(e);
                            this.length = 1, this[0] = o
                        }
                        return this.context = q, this.selector = e, this
                    }
                    return s.isFunction(e) ? r.ready(e) : (e.selector !== t && (this.selector = e.selector, this.context = e.context), s.makeArray(e, this))
                },
                selector: "",
                jquery: "1.7.2",
                length: 0,
                size: function() {
                    return this.length
                },
                toArray: function() {
                    return j.call(this, 0)
                },
                get: function(e) {
                    return null == e ? this.toArray() : 0 > e ? this[this.length + e] : this[e]
                },
                pushStack: function(e, t, n) {
                    var r = this.constructor();
                    return s.isArray(e) ? N.apply(r, e) : s.merge(r, e), r.prevObject = this, r.context = this.context, "find" === t ? r.selector = this.selector + (this.selector ? " " : "") + n : t && (r.selector = this.selector + "." + t + "(" + n + ")"), r
                },
                each: function(e, t) {
                    return s.each(this, e, t)
                },
                ready: function(e) {
                    return s.bindReady(), o.add(e), this
                },
                eq: function(e) {
                    return e = +e, -1 === e ? this.slice(e) : this.slice(e, e + 1)
                },
                first: function() {
                    return this.eq(0)
                },
                last: function() {
                    return this.eq(-1)
                },
                slice: function() {
                    return this.pushStack(j.apply(this, arguments), "slice", j.call(arguments).join(","))
                },
                map: function(e) {
                    return this.pushStack(s.map(this, function(t, n) {
                        return e.call(t, n, t)
                    }))
                },
                end: function() {
                    return this.prevObject || this.constructor(null)
                },
                push: N,
                sort: [].sort,
                splice: [].splice
            }, s.fn.init.prototype = s.fn, s.extend = s.fn.extend = function() {
                var e, n, r, i, o, a, c = arguments[0] || {}, l = 1,
                    u = arguments.length,
                    d = !1;
                for ("boolean" == typeof c && (d = c, c = arguments[1] || {}, l = 2), "object" == typeof c || s.isFunction(c) || (c = {}), u === l && (c = this, --l); u > l; l++)
                    if (null != (e = arguments[l]))
                        for (n in e) r = c[n], i = e[n], c !== i && (d && i && (s.isPlainObject(i) || (o = s.isArray(i))) ? (o ? (o = !1, a = r && s.isArray(r) ? r : []) : a = r && s.isPlainObject(r) ? r : {}, c[n] = s.extend(d, a, i)) : i !== t && (c[n] = i));
                return c
            }, s.extend({
                noConflict: function(t) {
                    return e.$ === s && (e.$ = l), t && e.jQuery === s && (e.jQuery = c), s
                },
                isReady: !1,
                readyWait: 1,
                holdReady: function(e) {
                    e ? s.readyWait++ : s.ready(!0)
                },
                ready: function(e) {
                    if (e === !0 && !--s.readyWait || e !== !0 && !s.isReady) {
                        if (!q.body) return setTimeout(s.ready, 1);
                        if (s.isReady = !0, e !== !0 && --s.readyWait > 0) return;
                        o.fireWith(q, [s]), s.fn.trigger && s(q).trigger("ready").off("ready")
                    }
                },
                bindReady: function() {
                    if (!o) {
                        if (o = s.Callbacks("once memory"), "complete" === q.readyState) return setTimeout(s.ready, 1);
                        if (q.addEventListener) q.addEventListener("DOMContentLoaded", a, !1), e.addEventListener("load", s.ready, !1);
                        else if (q.attachEvent) {
                            q.attachEvent("onreadystatechange", a), e.attachEvent("onload", s.ready);
                            var t = !1;
                            try {
                                t = null == e.frameElement
                            } catch (r) {}
                            q.documentElement.doScroll && t && n()
                        }
                    }
                },
                isFunction: function(e) {
                    return "function" === s.type(e)
                },
                isArray: Array.isArray || function(e) {
                    return "array" === s.type(e)
                },
                isWindow: function(e) {
                    return null != e && e == e.window
                },
                isNumeric: function(e) {
                    return !isNaN(parseFloat(e)) && isFinite(e)
                },
                type: function(e) {
                    return null == e ? String(e) : I[A.call(e)] || "object"
                },
                isPlainObject: function(e) {
                    if (!e || "object" !== s.type(e) || e.nodeType || s.isWindow(e)) return !1;
                    try {
                        if (e.constructor && !E.call(e, "constructor") && !E.call(e.constructor.prototype, "isPrototypeOf")) return !1
                    } catch (n) {
                        return !1
                    }
                    var r;
                    for (r in e);
                    return r === t || E.call(e, r)
                },
                isEmptyObject: function(e) {
                    for (var t in e) return !1;
                    return !0
                },
                error: function(e) {
                    throw new Error(e)
                },
                parseJSON: function(t) {
                    return "string" == typeof t && t ? (t = s.trim(t), e.JSON && e.JSON.parse ? e.JSON.parse(t) : g.test(t.replace(m, "@").replace(v, "]").replace(y, "")) ? new Function("return " + t)() : void s.error("Invalid JSON: " + t)) : null
                },
                parseXML: function(n) {
                    if ("string" != typeof n || !n) return null;
                    var r, i;
                    try {
                        e.DOMParser ? (i = new DOMParser, r = i.parseFromString(n, "text/xml")) : (r = new ActiveXObject("Microsoft.XMLDOM"), r.async = "false", r.loadXML(n))
                    } catch (o) {
                        r = t
                    }
                    return r && r.documentElement && !r.getElementsByTagName("parsererror").length || s.error("Invalid XML: " + n), r
                },
                noop: function() {},
                globalEval: function(t) {
                    t && d.test(t) && (e.execScript || function(t) {
                        e.eval.call(e, t)
                    })(t)
                },
                camelCase: function(e) {
                    return e.replace(T, "ms-").replace(x, C)
                },
                nodeName: function(e, t) {
                    return e.nodeName && e.nodeName.toUpperCase() === t.toUpperCase()
                },
                each: function(e, n, r) {
                    var i, o = 0,
                        a = e.length,
                        c = a === t || s.isFunction(e);
                    if (r)
                        if (c) {
                            for (i in e)
                                if (n.apply(e[i], r) === !1) break
                        } else
                            for (; a > o && n.apply(e[o++], r) !== !1;);
                    else if (c) {
                        for (i in e)
                            if (n.call(e[i], i, e[i]) === !1) break
                    } else
                        for (; a > o && n.call(e[o], o, e[o++]) !== !1;);
                    return e
                },
                trim: _ ? function(e) {
                    return null == e ? "" : _.call(e)
                } : function(e) {
                    return null == e ? "" : e.toString().replace(f, "").replace(p, "")
                },
                makeArray: function(e, t) {
                    var n = t || [];
                    if (null != e) {
                        var r = s.type(e);
                        null == e.length || "string" === r || "function" === r || "regexp" === r || s.isWindow(e) ? N.call(n, e) : s.merge(n, e)
                    }
                    return n
                },
                inArray: function(e, t, n) {
                    var r;
                    if (t) {
                        if (O) return O.call(t, e, n);
                        for (r = t.length, n = n ? 0 > n ? Math.max(0, r + n) : n : 0; r > n; n++)
                            if (n in t && t[n] === e) return n
                    }
                    return -1
                },
                merge: function(e, n) {
                    var r = e.length,
                        i = 0;
                    if ("number" == typeof n.length)
                        for (var o = n.length; o > i; i++) e[r++] = n[i];
                    else
                        for (; n[i] !== t;) e[r++] = n[i++];
                    return e.length = r, e
                },
                grep: function(e, t, n) {
                    var r, i = [];
                    n = !! n;
                    for (var o = 0, a = e.length; a > o; o++) r = !! t(e[o], o), n !== r && i.push(e[o]);
                    return i
                },
                map: function(e, n, r) {
                    var i, o, a = [],
                        c = 0,
                        l = e.length,
                        u = e instanceof s || l !== t && "number" == typeof l && (l > 0 && e[0] && e[l - 1] || 0 === l || s.isArray(e));
                    if (u)
                        for (; l > c; c++) i = n(e[c], c, r), null != i && (a[a.length] = i);
                    else
                        for (o in e) i = n(e[o], o, r), null != i && (a[a.length] = i);
                    return a.concat.apply([], a)
                },
                guid: 1,
                proxy: function(e, n) {
                    if ("string" == typeof n) {
                        var r = e[n];
                        n = e, e = r
                    }
                    if (!s.isFunction(e)) return t;
                    var i = j.call(arguments, 2),
                        o = function() {
                            return e.apply(n, i.concat(j.call(arguments)))
                        };
                    return o.guid = e.guid = e.guid || o.guid || s.guid++, o
                },
                access: function(e, n, r, i, o, a, c) {
                    var l, u = null == r,
                        d = 0,
                        f = e.length;
                    if (r && "object" == typeof r) {
                        for (d in r) s.access(e, n, d, r[d], 1, a, i);
                        o = 1
                    } else if (i !== t) {
                        if (l = c === t && s.isFunction(i), u && (l ? (l = n, n = function(e, t, n) {
                            return l.call(s(e), n)
                        }) : (n.call(e, i), n = null)), n)
                            for (; f > d; d++) n(e[d], r, l ? i.call(e[d], d, n(e[d], r)) : i, c);
                        o = 1
                    }
                    return o ? e : u ? n.call(e) : f ? n(e[0], r) : a
                },
                now: function() {
                    return (new Date).getTime()
                },
                uaMatch: function(e) {
                    e = e.toLowerCase();
                    var t = b.exec(e) || $.exec(e) || w.exec(e) || e.indexOf("compatible") < 0 && k.exec(e) || [];
                    return {
                        browser: t[1] || "",
                        version: t[2] || "0"
                    }
                },
                sub: function() {
                    function e(t, n) {
                        return new e.fn.init(t, n)
                    }
                    s.extend(!0, e, this), e.superclass = this, e.fn = e.prototype = this(), e.fn.constructor = e, e.sub = this.sub, e.fn.init = function(n, r) {
                        return r && r instanceof s && !(r instanceof e) && (r = e(r)), s.fn.init.call(this, n, r, t)
                    }, e.fn.init.prototype = e.fn;
                    var t = e(q);
                    return e
                },
                browser: {}
            }), s.each("Boolean Number String Function Array Date RegExp Object".split(" "), function(e, t) {
                I["[object " + t + "]"] = t.toLowerCase()
            }), i = s.uaMatch(S), i.browser && (s.browser[i.browser] = !0, s.browser.version = i.version), s.browser.webkit && (s.browser.safari = !0), d.test("Â ") && (f = /^[\s\xA0]+/, p = /[\s\xA0]+$/), r = s(q), q.addEventListener ? a = function() {
                q.removeEventListener("DOMContentLoaded", a, !1), s.ready()
            } : q.attachEvent && (a = function() {
                "complete" === q.readyState && (q.detachEvent("onreadystatechange", a), s.ready())
            }), s
        }(),
        D = {};
    I.Callbacks = function(e) {
        e = e ? D[e] || n(e) : {};
        var r, i, o, a, s, c, l = [],
            u = [],
            d = function(t) {
                var n, r, i, o;
                for (n = 0, r = t.length; r > n; n++) i = t[n], o = I.type(i), "array" === o ? d(i) : "function" === o && (e.unique && p.has(i) || l.push(i))
            }, f = function(t, n) {
                for (n = n || [], r = !e.memory || [t, n], i = !0, o = !0, c = a || 0, a = 0, s = l.length; l && s > c; c++)
                    if (l[c].apply(t, n) === !1 && e.stopOnFalse) {
                        r = !0;
                        break
                    }
                o = !1, l && (e.once ? r === !0 ? p.disable() : l = [] : u && u.length && (r = u.shift(), p.fireWith(r[0], r[1])))
            }, p = {
                add: function() {
                    if (l) {
                        var e = l.length;
                        d(arguments), o ? s = l.length : r && r !== !0 && (a = e, f(r[0], r[1]))
                    }
                    return this
                },
                remove: function() {
                    if (l)
                        for (var t = arguments, n = 0, r = t.length; r > n; n++)
                            for (var i = 0; i < l.length && (t[n] !== l[i] || (o && s >= i && (s--, c >= i && c--), l.splice(i--, 1), !e.unique)); i++);
                    return this
                },
                has: function(e) {
                    if (l)
                        for (var t = 0, n = l.length; n > t; t++)
                            if (e === l[t]) return !0;
                    return !1
                },
                empty: function() {
                    return l = [], this
                },
                disable: function() {
                    return l = u = r = t, this
                },
                disabled: function() {
                    return !l
                },
                lock: function() {
                    return u = t, r && r !== !0 || p.disable(), this
                },
                locked: function() {
                    return !u
                },
                fireWith: function(t, n) {
                    return u && (o ? e.once || u.push([t, n]) : e.once && r || f(t, n)), this
                },
                fire: function() {
                    return p.fireWith(this, arguments), this
                },
                fired: function() {
                    return !!i
                }
            };
        return p
    };
    var L = [].slice;
    I.extend({
        Deferred: function(e) {
            var t, n = I.Callbacks("once memory"),
                r = I.Callbacks("once memory"),
                i = I.Callbacks("memory"),
                o = "pending",
                a = {
                    resolve: n,
                    reject: r,
                    notify: i
                }, s = {
                    done: n.add,
                    fail: r.add,
                    progress: i.add,
                    state: function() {
                        return o
                    },
                    isResolved: n.fired,
                    isRejected: r.fired,
                    then: function(e, t, n) {
                        return c.done(e).fail(t).progress(n), this
                    },
                    always: function() {
                        return c.done.apply(c, arguments).fail.apply(c, arguments), this
                    },
                    pipe: function(e, t, n) {
                        return I.Deferred(function(r) {
                            I.each({
                                done: [e, "resolve"],
                                fail: [t, "reject"],
                                progress: [n, "notify"]
                            }, function(e, t) {
                                var n, i = t[0],
                                    o = t[1];
                                c[e](I.isFunction(i) ? function() {
                                    n = i.apply(this, arguments), n && I.isFunction(n.promise) ? n.promise().then(r.resolve, r.reject, r.notify) : r[o + "With"](this === c ? r : this, [n])
                                } : r[o])
                            })
                        }).promise()
                    },
                    promise: function(e) {
                        if (null == e) e = s;
                        else
                            for (var t in s) e[t] = s[t];
                        return e
                    }
                }, c = s.promise({});
            for (t in a) c[t] = a[t].fire, c[t + "With"] = a[t].fireWith;
            return c.done(function() {
                o = "resolved"
            }, r.disable, i.lock).fail(function() {
                o = "rejected"
            }, n.disable, i.lock), e && e.call(c, c), c
        },
        when: function(e) {
            function t(e) {
                return function(t) {
                    r[e] = arguments.length > 1 ? L.call(arguments, 0) : t, --s || c.resolveWith(c, r)
                }
            }

            function n(e) {
                return function(t) {
                    a[e] = arguments.length > 1 ? L.call(arguments, 0) : t, c.notifyWith(l, a)
                }
            }
            var r = L.call(arguments, 0),
                i = 0,
                o = r.length,
                a = new Array(o),
                s = o,
                c = 1 >= o && e && I.isFunction(e.promise) ? e : I.Deferred(),
                l = c.promise();
            if (o > 1) {
                for (; o > i; i++) r[i] && r[i].promise && I.isFunction(r[i].promise) ? r[i].promise().then(t(i), c.reject, n(i)) : --s;
                s || c.resolveWith(c, r)
            } else c !== e && c.resolveWith(c, o ? [e] : []);
            return l
        }
    }), I.support = function() {
        {
            var t, n, r, i, o, a, s, c, l, u, d, f = q.createElement("div");
            q.documentElement
        }
        if (f.setAttribute("className", "t"), f.innerHTML = "   <link/><table></table><a href='/a' style='top:1px;float:left;opacity:.55;'>a</a><input type='checkbox'/>", n = f.getElementsByTagName("*"), r = f.getElementsByTagName("a")[0], !n || !n.length || !r) return {};
        i = q.createElement("select"), o = i.appendChild(q.createElement("option")), a = f.getElementsByTagName("input")[0], t = {
            leadingWhitespace: 3 === f.firstChild.nodeType,
            tbody: !f.getElementsByTagName("tbody").length,
            htmlSerialize: !! f.getElementsByTagName("link").length,
            style: /top/.test(r.getAttribute("style")),
            hrefNormalized: "/a" === r.getAttribute("href"),
            opacity: /^0.55/.test(r.style.opacity),
            cssFloat: !! r.style.cssFloat,
            checkOn: "on" === a.value,
            optSelected: o.selected,
            getSetAttribute: "t" !== f.className,
            enctype: !! q.createElement("form").enctype,
            html5Clone: "<:nav></:nav>" !== q.createElement("nav").cloneNode(!0).outerHTML,
            submitBubbles: !0,
            changeBubbles: !0,
            focusinBubbles: !1,
            deleteExpando: !0,
            noCloneEvent: !0,
            inlineBlockNeedsLayout: !1,
            shrinkWrapBlocks: !1,
            reliableMarginRight: !0,
            pixelMargin: !0
        }, I.boxModel = t.boxModel = "CSS1Compat" === q.compatMode, a.checked = !0, t.noCloneChecked = a.cloneNode(!0).checked, i.disabled = !0, t.optDisabled = !o.disabled;
        try {
            delete f.test
        } catch (p) {
            t.deleteExpando = !1
        }
        if (!f.addEventListener && f.attachEvent && f.fireEvent && (f.attachEvent("onclick", function() {
            t.noCloneEvent = !1
        }), f.cloneNode(!0).fireEvent("onclick")), a = q.createElement("input"), a.value = "t", a.setAttribute("type", "radio"), t.radioValue = "t" === a.value, a.setAttribute("checked", "checked"), a.setAttribute("name", "t"), f.appendChild(a), s = q.createDocumentFragment(), s.appendChild(f.lastChild), t.checkClone = s.cloneNode(!0).cloneNode(!0).lastChild.checked, t.appendChecked = a.checked, s.removeChild(a), s.appendChild(f), f.attachEvent)
            for (u in {
                submit: 1,
                change: 1,
                focusin: 1
            }) l = "on" + u, d = l in f, d || (f.setAttribute(l, "return;"), d = "function" == typeof f[l]), t[u + "Bubbles"] = d;
        return s.removeChild(f), s = i = o = f = a = null, I(function() {
            var n, r, i, o, a, s, l, u, p, h, g, m, v = q.getElementsByTagName("body")[0];
            v && (l = 1, m = "padding:0;margin:0;border:", h = "position:absolute;top:0;left:0;width:1px;height:1px;", g = m + "0;visibility:hidden;", u = "style='" + h + m + "5px solid #000;", p = "<div " + u + "display:block;'><div style='" + m + "0;display:block;overflow:hidden;'></div></div><table " + u + "' cellpadding='0' cellspacing='0'><tr><td></td></tr></table>", n = q.createElement("div"), n.style.cssText = g + "width:0;height:0;position:static;top:0;margin-top:" + l + "px", v.insertBefore(n, v.firstChild), f = q.createElement("div"), n.appendChild(f), f.innerHTML = "<table><tr><td style='" + m + "0;display:none'></td><td>t</td></tr></table>", c = f.getElementsByTagName("td"), d = 0 === c[0].offsetHeight, c[0].style.display = "", c[1].style.display = "none", t.reliableHiddenOffsets = d && 0 === c[0].offsetHeight, e.getComputedStyle && (f.innerHTML = "", s = q.createElement("div"), s.style.width = "0", s.style.marginRight = "0", f.style.width = "2px", f.appendChild(s), t.reliableMarginRight = 0 === (parseInt((e.getComputedStyle(s, null) || {
                marginRight: 0
            }).marginRight, 10) || 0)), "undefined" != typeof f.style.zoom && (f.innerHTML = "", f.style.width = f.style.padding = "1px", f.style.border = 0, f.style.overflow = "hidden", f.style.display = "inline", f.style.zoom = 1, t.inlineBlockNeedsLayout = 3 === f.offsetWidth, f.style.display = "block", f.style.overflow = "visible", f.innerHTML = "<div style='width:5px;'></div>", t.shrinkWrapBlocks = 3 !== f.offsetWidth), f.style.cssText = h + g, f.innerHTML = p, r = f.firstChild, i = r.firstChild, o = r.nextSibling.firstChild.firstChild, a = {
                doesNotAddBorder: 5 !== i.offsetTop,
                doesAddBorderForTableAndCells: 5 === o.offsetTop
            }, i.style.position = "fixed", i.style.top = "20px", a.fixedPosition = 20 === i.offsetTop || 15 === i.offsetTop, i.style.position = i.style.top = "", r.style.overflow = "hidden", r.style.position = "relative", a.subtractsBorderForOverflowNotVisible = -5 === i.offsetTop, a.doesNotIncludeMarginInBodyOffset = v.offsetTop !== l, e.getComputedStyle && (f.style.marginTop = "1%", t.pixelMargin = "1%" !== (e.getComputedStyle(f, null) || {
                marginTop: 0
            }).marginTop), "undefined" != typeof n.style.zoom && (n.style.zoom = 1), v.removeChild(n), s = f = n = null, I.extend(t, a))
        }), t
    }();
    var P = /^(?:\{.*\}|\[.*\])$/,
        F = /([A-Z])/g;
    I.extend({
        cache: {},
        uuid: 0,
        expando: "jQuery" + (I.fn.jquery + Math.random()).replace(/\D/g, ""),
        noData: {
            embed: !0,
            object: "clsid:D27CDB6E-AE6D-11cf-96B8-444553540000",
            applet: !0
        },
        hasData: function(e) {
            return e = e.nodeType ? I.cache[e[I.expando]] : e[I.expando], !! e && !i(e)
        },
        data: function(e, n, r, i) {
            if (I.acceptData(e)) {
                var o, a, s, c = I.expando,
                    l = "string" == typeof n,
                    u = e.nodeType,
                    d = u ? I.cache : e,
                    f = u ? e[c] : e[c] && c,
                    p = "events" === n;
                if (f && d[f] && (p || i || d[f].data) || !l || r !== t) return f || (u ? e[c] = f = ++I.uuid : f = c), d[f] || (d[f] = {}, u || (d[f].toJSON = I.noop)), ("object" == typeof n || "function" == typeof n) && (i ? d[f] = I.extend(d[f], n) : d[f].data = I.extend(d[f].data, n)), o = a = d[f], i || (a.data || (a.data = {}), a = a.data), r !== t && (a[I.camelCase(n)] = r), p && !a[n] ? o.events : (l ? (s = a[n], null == s && (s = a[I.camelCase(n)])) : s = a, s)
            }
        },
        removeData: function(e, t, n) {
            if (I.acceptData(e)) {
                var r, o, a, s = I.expando,
                    c = e.nodeType,
                    l = c ? I.cache : e,
                    u = c ? e[s] : s;
                if (l[u]) {
                    if (t && (r = n ? l[u] : l[u].data)) {
                        I.isArray(t) || (t in r ? t = [t] : (t = I.camelCase(t), t = t in r ? [t] : t.split(" ")));
                        for (o = 0, a = t.length; a > o; o++) delete r[t[o]];
                        if (!(n ? i : I.isEmptyObject)(r)) return
                    }(n || (delete l[u].data, i(l[u]))) && (I.support.deleteExpando || !l.setInterval ? delete l[u] : l[u] = null, c && (I.support.deleteExpando ? delete e[s] : e.removeAttribute ? e.removeAttribute(s) : e[s] = null))
                }
            }
        },
        _data: function(e, t, n) {
            return I.data(e, t, n, !0)
        },
        acceptData: function(e) {
            if (e.nodeName) {
                var t = I.noData[e.nodeName.toLowerCase()];
                if (t) return !(t === !0 || e.getAttribute("classid") !== t)
            }
            return !0
        }
    }), I.fn.extend({
        data: function(e, n) {
            var i, o, a, s, c, l = this[0],
                u = 0,
                d = null;
            if (e === t) {
                if (this.length && (d = I.data(l), 1 === l.nodeType && !I._data(l, "parsedAttrs"))) {
                    for (a = l.attributes, c = a.length; c > u; u++) s = a[u].name, 0 === s.indexOf("data-") && (s = I.camelCase(s.substring(5)), r(l, s, d[s]));
                    I._data(l, "parsedAttrs", !0)
                }
                return d
            }
            return "object" == typeof e ? this.each(function() {
                I.data(this, e)
            }) : (i = e.split(".", 2), i[1] = i[1] ? "." + i[1] : "", o = i[1] + "!", I.access(this, function(n) {
                return n === t ? (d = this.triggerHandler("getData" + o, [i[0]]), d === t && l && (d = I.data(l, e), d = r(l, e, d)), d === t && i[1] ? this.data(i[0]) : d) : (i[1] = n, void this.each(function() {
                    var t = I(this);
                    t.triggerHandler("setData" + o, i), I.data(this, e, n), t.triggerHandler("changeData" + o, i)
                }))
            }, null, n, arguments.length > 1, null, !1))
        },
        removeData: function(e) {
            return this.each(function() {
                I.removeData(this, e)
            })
        }
    }), I.extend({
        _mark: function(e, t) {
            e && (t = (t || "fx") + "mark", I._data(e, t, (I._data(e, t) || 0) + 1))
        },
        _unmark: function(e, t, n) {
            if (e !== !0 && (n = t, t = e, e = !1), t) {
                n = n || "fx";
                var r = n + "mark",
                    i = e ? 0 : (I._data(t, r) || 1) - 1;
                i ? I._data(t, r, i) : (I.removeData(t, r, !0), o(t, n, "mark"))
            }
        },
        queue: function(e, t, n) {
            var r;
            return e ? (t = (t || "fx") + "queue", r = I._data(e, t), n && (!r || I.isArray(n) ? r = I._data(e, t, I.makeArray(n)) : r.push(n)), r || []) : void 0
        },
        dequeue: function(e, t) {
            t = t || "fx";
            var n = I.queue(e, t),
                r = n.shift(),
                i = {};
            "inprogress" === r && (r = n.shift()), r && ("fx" === t && n.unshift("inprogress"), I._data(e, t + ".run", i), r.call(e, function() {
                I.dequeue(e, t)
            }, i)), n.length || (I.removeData(e, t + "queue " + t + ".run", !0), o(e, t, "queue"))
        }
    }), I.fn.extend({
        queue: function(e, n) {
            var r = 2;
            return "string" != typeof e && (n = e, e = "fx", r--), arguments.length < r ? I.queue(this[0], e) : n === t ? this : this.each(function() {
                var t = I.queue(this, e, n);
                "fx" === e && "inprogress" !== t[0] && I.dequeue(this, e)
            })
        },
        dequeue: function(e) {
            return this.each(function() {
                I.dequeue(this, e)
            })
        },
        delay: function(e, t) {
            return e = I.fx ? I.fx.speeds[e] || e : e, t = t || "fx", this.queue(t, function(t, n) {
                var r = setTimeout(t, e);
                n.stop = function() {
                    clearTimeout(r)
                }
            })
        },
        clearQueue: function(e) {
            return this.queue(e || "fx", [])
        },
        promise: function(e, n) {
            function r() {
                --c || o.resolveWith(a, [a])
            }
            "string" != typeof e && (n = e, e = t), e = e || "fx";
            for (var i, o = I.Deferred(), a = this, s = a.length, c = 1, l = e + "defer", u = e + "queue", d = e + "mark"; s--;)(i = I.data(a[s], l, t, !0) || (I.data(a[s], u, t, !0) || I.data(a[s], d, t, !0)) && I.data(a[s], l, I.Callbacks("once memory"), !0)) && (c++, i.add(r));
            return r(), o.promise(n)
        }
    });
    var R, z, H, B = /[\n\t\r]/g,
        U = /\s+/,
        W = /\r/g,
        V = /^(?:button|input)$/i,
        J = /^(?:button|input|object|select|textarea)$/i,
        X = /^a(?:rea)?$/i,
        G = /^(?:autofocus|autoplay|async|checked|controls|defer|disabled|hidden|loop|multiple|open|readonly|required|scoped|selected)$/i,
        K = I.support.getSetAttribute;
    I.fn.extend({
        attr: function(e, t) {
            return I.access(this, I.attr, e, t, arguments.length > 1)
        },
        removeAttr: function(e) {
            return this.each(function() {
                I.removeAttr(this, e)
            })
        },
        prop: function(e, t) {
            return I.access(this, I.prop, e, t, arguments.length > 1)
        },
        removeProp: function(e) {
            return e = I.propFix[e] || e, this.each(function() {
                try {
                    this[e] = t, delete this[e]
                } catch (n) {}
            })
        },
        addClass: function(e) {
            var t, n, r, i, o, a, s;
            if (I.isFunction(e)) return this.each(function(t) {
                I(this).addClass(e.call(this, t, this.className))
            });
            if (e && "string" == typeof e)
                for (t = e.split(U), n = 0, r = this.length; r > n; n++)
                    if (i = this[n], 1 === i.nodeType)
                        if (i.className || 1 !== t.length) {
                            for (o = " " + i.className + " ", a = 0, s = t.length; s > a; a++)~ o.indexOf(" " + t[a] + " ") || (o += t[a] + " ");
                            i.className = I.trim(o)
                        } else i.className = e;
            return this
        },
        removeClass: function(e) {
            var n, r, i, o, a, s, c;
            if (I.isFunction(e)) return this.each(function(t) {
                I(this).removeClass(e.call(this, t, this.className))
            });
            if (e && "string" == typeof e || e === t)
                for (n = (e || "").split(U), r = 0, i = this.length; i > r; r++)
                    if (o = this[r], 1 === o.nodeType && o.className)
                        if (e) {
                            for (a = (" " + o.className + " ").replace(B, " "), s = 0, c = n.length; c > s; s++) a = a.replace(" " + n[s] + " ", " ");
                            o.className = I.trim(a)
                        } else o.className = "";
            return this
        },
        toggleClass: function(e, t) {
            var n = typeof e,
                r = "boolean" == typeof t;
            return this.each(I.isFunction(e) ? function(n) {
                I(this).toggleClass(e.call(this, n, this.className, t), t)
            } : function() {
                if ("string" === n)
                    for (var i, o = 0, a = I(this), s = t, c = e.split(U); i = c[o++];) s = r ? s : !a.hasClass(i), a[s ? "addClass" : "removeClass"](i);
                else("undefined" === n || "boolean" === n) && (this.className && I._data(this, "__className__", this.className), this.className = this.className || e === !1 ? "" : I._data(this, "__className__") || "")
            })
        },
        hasClass: function(e) {
            for (var t = " " + e + " ", n = 0, r = this.length; r > n; n++)
                if (1 === this[n].nodeType && (" " + this[n].className + " ").replace(B, " ").indexOf(t) > -1) return !0;
            return !1
        },
        val: function(e) {
            var n, r, i, o = this[0]; {
                if (arguments.length) return i = I.isFunction(e), this.each(function(r) {
                    var o, a = I(this);
                    1 === this.nodeType && (o = i ? e.call(this, r, a.val()) : e, null == o ? o = "" : "number" == typeof o ? o += "" : I.isArray(o) && (o = I.map(o, function(e) {
                        return null == e ? "" : e + ""
                    })), n = I.valHooks[this.type] || I.valHooks[this.nodeName.toLowerCase()], n && "set" in n && n.set(this, o, "value") !== t || (this.value = o))
                });
                if (o) return n = I.valHooks[o.type] || I.valHooks[o.nodeName.toLowerCase()], n && "get" in n && (r = n.get(o, "value")) !== t ? r : (r = o.value, "string" == typeof r ? r.replace(W, "") : null == r ? "" : r)
            }
        }
    }), I.extend({
        valHooks: {
            option: {
                get: function(e) {
                    var t = e.attributes.value;
                    return !t || t.specified ? e.value : e.text
                }
            },
            select: {
                get: function(e) {
                    var t, n, r, i, o = e.selectedIndex,
                        a = [],
                        s = e.options,
                        c = "select-one" === e.type;
                    if (0 > o) return null;
                    for (n = c ? o : 0, r = c ? o + 1 : s.length; r > n; n++)
                        if (i = s[n], !(!i.selected || (I.support.optDisabled ? i.disabled : null !== i.getAttribute("disabled")) || i.parentNode.disabled && I.nodeName(i.parentNode, "optgroup"))) {
                            if (t = I(i).val(), c) return t;
                            a.push(t)
                        }
                    return c && !a.length && s.length ? I(s[o]).val() : a
                },
                set: function(e, t) {
                    var n = I.makeArray(t);
                    return I(e).find("option").each(function() {
                        this.selected = I.inArray(I(this).val(), n) >= 0
                    }), n.length || (e.selectedIndex = -1), n
                }
            }
        },
        attrFn: {
            val: !0,
            css: !0,
            html: !0,
            text: !0,
            data: !0,
            width: !0,
            height: !0,
            offset: !0
        },
        attr: function(e, n, r, i) {
            var o, a, s, c = e.nodeType;
            if (e && 3 !== c && 8 !== c && 2 !== c) return i && n in I.attrFn ? I(e)[n](r) : "undefined" == typeof e.getAttribute ? I.prop(e, n, r) : (s = 1 !== c || !I.isXMLDoc(e), s && (n = n.toLowerCase(), a = I.attrHooks[n] || (G.test(n) ? z : R)), r !== t ? null === r ? void I.removeAttr(e, n) : a && "set" in a && s && (o = a.set(e, r, n)) !== t ? o : (e.setAttribute(n, "" + r), r) : a && "get" in a && s && null !== (o = a.get(e, n)) ? o : (o = e.getAttribute(n), null === o ? t : o))
        },
        removeAttr: function(e, t) {
            var n, r, i, o, a, s = 0;
            if (t && 1 === e.nodeType)
                for (r = t.toLowerCase().split(U), o = r.length; o > s; s++) i = r[s], i && (n = I.propFix[i] || i, a = G.test(i), a || I.attr(e, i, ""), e.removeAttribute(K ? i : n), a && n in e && (e[n] = !1))
        },
        attrHooks: {
            type: {
                set: function(e, t) {
                    if (V.test(e.nodeName) && e.parentNode) I.error("type property can't be changed");
                    else if (!I.support.radioValue && "radio" === t && I.nodeName(e, "input")) {
                        var n = e.value;
                        return e.setAttribute("type", t), n && (e.value = n), t
                    }
                }
            },
            value: {
                get: function(e, t) {
                    return R && I.nodeName(e, "button") ? R.get(e, t) : t in e ? e.value : null
                },
                set: function(e, t, n) {
                    return R && I.nodeName(e, "button") ? R.set(e, t, n) : void(e.value = t)
                }
            }
        },
        propFix: {
            tabindex: "tabIndex",
            readonly: "readOnly",
            "for": "htmlFor",
            "class": "className",
            maxlength: "maxLength",
            cellspacing: "cellSpacing",
            cellpadding: "cellPadding",
            rowspan: "rowSpan",
            colspan: "colSpan",
            usemap: "useMap",
            frameborder: "frameBorder",
            contenteditable: "contentEditable"
        },
        prop: function(e, n, r) {
            var i, o, a, s = e.nodeType;
            if (e && 3 !== s && 8 !== s && 2 !== s) return a = 1 !== s || !I.isXMLDoc(e), a && (n = I.propFix[n] || n, o = I.propHooks[n]), r !== t ? o && "set" in o && (i = o.set(e, r, n)) !== t ? i : e[n] = r : o && "get" in o && null !== (i = o.get(e, n)) ? i : e[n]
        },
        propHooks: {
            tabIndex: {
                get: function(e) {
                    var n = e.getAttributeNode("tabindex");
                    return n && n.specified ? parseInt(n.value, 10) : J.test(e.nodeName) || X.test(e.nodeName) && e.href ? 0 : t
                }
            }
        }
    }), I.attrHooks.tabindex = I.propHooks.tabIndex, z = {
        get: function(e, n) {
            var r, i = I.prop(e, n);
            return i === !0 || "boolean" != typeof i && (r = e.getAttributeNode(n)) && r.nodeValue !== !1 ? n.toLowerCase() : t
        },
        set: function(e, t, n) {
            var r;
            return t === !1 ? I.removeAttr(e, n) : (r = I.propFix[n] || n, r in e && (e[r] = !0), e.setAttribute(n, n.toLowerCase())), n
        }
    }, K || (H = {
        name: !0,
        id: !0,
        coords: !0
    }, R = I.valHooks.button = {
        get: function(e, n) {
            var r;
            return r = e.getAttributeNode(n), r && (H[n] ? "" !== r.nodeValue : r.specified) ? r.nodeValue : t
        },
        set: function(e, t, n) {
            var r = e.getAttributeNode(n);
            return r || (r = q.createAttribute(n), e.setAttributeNode(r)), r.nodeValue = t + ""
        }
    }, I.attrHooks.tabindex.set = R.set, I.each(["width", "height"], function(e, t) {
        I.attrHooks[t] = I.extend(I.attrHooks[t], {
            set: function(e, n) {
                return "" === n ? (e.setAttribute(t, "auto"), n) : void 0
            }
        })
    }), I.attrHooks.contenteditable = {
        get: R.get,
        set: function(e, t, n) {
            "" === t && (t = "false"), R.set(e, t, n)
        }
    }), I.support.hrefNormalized || I.each(["href", "src", "width", "height"], function(e, n) {
        I.attrHooks[n] = I.extend(I.attrHooks[n], {
            get: function(e) {
                var r = e.getAttribute(n, 2);
                return null === r ? t : r
            }
        })
    }), I.support.style || (I.attrHooks.style = {
        get: function(e) {
            return e.style.cssText.toLowerCase() || t
        },
        set: function(e, t) {
            return e.style.cssText = "" + t
        }
    }), I.support.optSelected || (I.propHooks.selected = I.extend(I.propHooks.selected, {
        get: function(e) {
            var t = e.parentNode;
            return t && (t.selectedIndex, t.parentNode && t.parentNode.selectedIndex), null
        }
    })), I.support.enctype || (I.propFix.enctype = "encoding"), I.support.checkOn || I.each(["radio", "checkbox"], function() {
        I.valHooks[this] = {
            get: function(e) {
                return null === e.getAttribute("value") ? "on" : e.value
            }
        }
    }), I.each(["radio", "checkbox"], function() {
        I.valHooks[this] = I.extend(I.valHooks[this], {
            set: function(e, t) {
                return I.isArray(t) ? e.checked = I.inArray(I(e).val(), t) >= 0 : void 0
            }
        })
    });
    var Q = /^(?:textarea|input|select)$/i,
        Y = /^([^\.]*)?(?:\.(.+))?$/,
        Z = /(?:^|\s)hover(\.\S+)?\b/,
        et = /^key/,
        tt = /^(?:mouse|contextmenu)|click/,
        nt = /^(?:focusinfocus|focusoutblur)$/,
        rt = /^(\w*)(?:#([\w\-]+))?(?:\.([\w\-]+))?$/,
        it = function(e) {
            var t = rt.exec(e);
            return t && (t[1] = (t[1] || "").toLowerCase(), t[3] = t[3] && new RegExp("(?:^|\\s)" + t[3] + "(?:\\s|$)")), t
        }, ot = function(e, t) {
            var n = e.attributes || {};
            return !(t[1] && e.nodeName.toLowerCase() !== t[1] || t[2] && (n.id || {}).value !== t[2] || t[3] && !t[3].test((n["class"] || {}).value))
        }, at = function(e) {
            return I.event.special.hover ? e : e.replace(Z, "mouseenter$1 mouseleave$1")
        };
    I.event = {
        add: function(e, n, r, i, o) {
            var a, s, c, l, u, d, f, p, h, g, m;
            if (3 !== e.nodeType && 8 !== e.nodeType && n && r && (a = I._data(e))) {
                for (r.handler && (h = r, r = h.handler, o = h.selector), r.guid || (r.guid = I.guid++), c = a.events, c || (a.events = c = {}), s = a.handle, s || (a.handle = s = function(e) {
                    return "undefined" == typeof I || e && I.event.triggered === e.type ? t : I.event.dispatch.apply(s.elem, arguments)
                }, s.elem = e), n = I.trim(at(n)).split(" "), l = 0; l < n.length; l++) u = Y.exec(n[l]) || [], d = u[1], f = (u[2] || "").split(".").sort(), m = I.event.special[d] || {}, d = (o ? m.delegateType : m.bindType) || d, m = I.event.special[d] || {}, p = I.extend({
                    type: d,
                    origType: u[1],
                    data: i,
                    handler: r,
                    guid: r.guid,
                    selector: o,
                    quick: o && it(o),
                    namespace: f.join(".")
                }, h), g = c[d], g || (g = c[d] = [], g.delegateCount = 0, m.setup && m.setup.call(e, i, f, s) !== !1 || (e.addEventListener ? e.addEventListener(d, s, !1) : e.attachEvent && e.attachEvent("on" + d, s))), m.add && (m.add.call(e, p), p.handler.guid || (p.handler.guid = r.guid)), o ? g.splice(g.delegateCount++, 0, p) : g.push(p), I.event.global[d] = !0;
                e = null
            }
        },
        global: {},
        remove: function(e, t, n, r, i) {
            var o, a, s, c, l, u, d, f, p, h, g, m, v = I.hasData(e) && I._data(e);
            if (v && (f = v.events)) {
                for (t = I.trim(at(t || "")).split(" "), o = 0; o < t.length; o++)
                    if (a = Y.exec(t[o]) || [], s = c = a[1], l = a[2], s) {
                        for (p = I.event.special[s] || {}, s = (r ? p.delegateType : p.bindType) || s, g = f[s] || [], u = g.length, l = l ? new RegExp("(^|\\.)" + l.split(".").sort().join("\\.(?:.*\\.)?") + "(\\.|$)") : null, d = 0; d < g.length; d++) m = g[d], !i && c !== m.origType || n && n.guid !== m.guid || l && !l.test(m.namespace) || r && r !== m.selector && ("**" !== r || !m.selector) || (g.splice(d--, 1), m.selector && g.delegateCount--, p.remove && p.remove.call(e, m));
                        0 === g.length && u !== g.length && (p.teardown && p.teardown.call(e, l) !== !1 || I.removeEvent(e, s, v.handle), delete f[s])
                    } else
                        for (s in f) I.event.remove(e, s + t[o], n, r, !0);
                I.isEmptyObject(f) && (h = v.handle, h && (h.elem = null), I.removeData(e, ["events", "handle"], !0))
            }
        },
        customEvent: {
            getData: !0,
            setData: !0,
            changeData: !0
        },
        trigger: function(n, r, i, o) {
            if (!i || 3 !== i.nodeType && 8 !== i.nodeType) {
                var a, s, c, l, u, d, f, p, h, g, m = n.type || n,
                    v = [];
                if (!nt.test(m + I.event.triggered) && (m.indexOf("!") >= 0 && (m = m.slice(0, -1), s = !0), m.indexOf(".") >= 0 && (v = m.split("."), m = v.shift(), v.sort()), i && !I.event.customEvent[m] || I.event.global[m]))
                    if (n = "object" == typeof n ? n[I.expando] ? n : new I.Event(m, n) : new I.Event(m), n.type = m, n.isTrigger = !0, n.exclusive = s, n.namespace = v.join("."), n.namespace_re = n.namespace ? new RegExp("(^|\\.)" + v.join("\\.(?:.*\\.)?") + "(\\.|$)") : null, d = m.indexOf(":") < 0 ? "on" + m : "", i) {
                        if (n.result = t, n.target || (n.target = i), r = null != r ? I.makeArray(r) : [], r.unshift(n), f = I.event.special[m] || {}, !f.trigger || f.trigger.apply(i, r) !== !1) {
                            if (h = [
                                [i, f.bindType || m]
                            ], !o && !f.noBubble && !I.isWindow(i)) {
                                for (g = f.delegateType || m, l = nt.test(g + m) ? i : i.parentNode, u = null; l; l = l.parentNode) h.push([l, g]), u = l;
                                u && u === i.ownerDocument && h.push([u.defaultView || u.parentWindow || e, g])
                            }
                            for (c = 0; c < h.length && !n.isPropagationStopped(); c++) l = h[c][0], n.type = h[c][1], p = (I._data(l, "events") || {})[n.type] && I._data(l, "handle"), p && p.apply(l, r), p = d && l[d], p && I.acceptData(l) && p.apply(l, r) === !1 && n.preventDefault();
                            return n.type = m, o || n.isDefaultPrevented() || f._default && f._default.apply(i.ownerDocument, r) !== !1 || "click" === m && I.nodeName(i, "a") || !I.acceptData(i) || d && i[m] && ("focus" !== m && "blur" !== m || 0 !== n.target.offsetWidth) && !I.isWindow(i) && (u = i[d], u && (i[d] = null), I.event.triggered = m, i[m](), I.event.triggered = t, u && (i[d] = u)), n.result
                        }
                    } else {
                        a = I.cache;
                        for (c in a) a[c].events && a[c].events[m] && I.event.trigger(n, r, a[c].handle.elem, !0)
                    }
            }
        },
        dispatch: function(n) {
            n = I.event.fix(n || e.event);
            var r, i, o, a, s, c, l, u, d, f, p = (I._data(this, "events") || {})[n.type] || [],
                h = p.delegateCount,
                g = [].slice.call(arguments, 0),
                m = !n.exclusive && !n.namespace,
                v = I.event.special[n.type] || {}, y = [];
            if (g[0] = n, n.delegateTarget = this, !v.preDispatch || v.preDispatch.call(this, n) !== !1) {
                if (h && (!n.button || "click" !== n.type))
                    for (a = I(this), a.context = this.ownerDocument || this, o = n.target; o != this; o = o.parentNode || this)
                        if (o.disabled !== !0) {
                            for (c = {}, u = [], a[0] = o, r = 0; h > r; r++) d = p[r], f = d.selector, c[f] === t && (c[f] = d.quick ? ot(o, d.quick) : a.is(f)), c[f] && u.push(d);
                            u.length && y.push({
                                elem: o,
                                matches: u
                            })
                        }
                for (p.length > h && y.push({
                    elem: this,
                    matches: p.slice(h)
                }), r = 0; r < y.length && !n.isPropagationStopped(); r++)
                    for (l = y[r], n.currentTarget = l.elem, i = 0; i < l.matches.length && !n.isImmediatePropagationStopped(); i++) d = l.matches[i], (m || !n.namespace && !d.namespace || n.namespace_re && n.namespace_re.test(d.namespace)) && (n.data = d.data, n.handleObj = d, s = ((I.event.special[d.origType] || {}).handle || d.handler).apply(l.elem, g), s !== t && (n.result = s, s === !1 && (n.preventDefault(), n.stopPropagation())));
                return v.postDispatch && v.postDispatch.call(this, n), n.result
            }
        },
        props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
        fixHooks: {},
        keyHooks: {
            props: "char charCode key keyCode".split(" "),
            filter: function(e, t) {
                return null == e.which && (e.which = null != t.charCode ? t.charCode : t.keyCode), e
            }
        },
        mouseHooks: {
            props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
            filter: function(e, n) {
                var r, i, o, a = n.button,
                    s = n.fromElement;
                return null == e.pageX && null != n.clientX && (r = e.target.ownerDocument || q, i = r.documentElement, o = r.body, e.pageX = n.clientX + (i && i.scrollLeft || o && o.scrollLeft || 0) - (i && i.clientLeft || o && o.clientLeft || 0), e.pageY = n.clientY + (i && i.scrollTop || o && o.scrollTop || 0) - (i && i.clientTop || o && o.clientTop || 0)), !e.relatedTarget && s && (e.relatedTarget = s === e.target ? n.toElement : s), e.which || a === t || (e.which = 1 & a ? 1 : 2 & a ? 3 : 4 & a ? 2 : 0), e
            }
        },
        fix: function(e) {
            if (e[I.expando]) return e;
            var n, r, i = e,
                o = I.event.fixHooks[e.type] || {}, a = o.props ? this.props.concat(o.props) : this.props;
            for (e = I.Event(i), n = a.length; n;) r = a[--n], e[r] = i[r];
            return e.target || (e.target = i.srcElement || q), 3 === e.target.nodeType && (e.target = e.target.parentNode), e.metaKey === t && (e.metaKey = e.ctrlKey), o.filter ? o.filter(e, i) : e
        },
        special: {
            ready: {
                setup: I.bindReady
            },
            load: {
                noBubble: !0
            },
            focus: {
                delegateType: "focusin"
            },
            blur: {
                delegateType: "focusout"
            },
            beforeunload: {
                setup: function(e, t, n) {
                    I.isWindow(this) && (this.onbeforeunload = n)
                },
                teardown: function(e, t) {
                    this.onbeforeunload === t && (this.onbeforeunload = null)
                }
            }
        },
        simulate: function(e, t, n, r) {
            var i = I.extend(new I.Event, n, {
                type: e,
                isSimulated: !0,
                originalEvent: {}
            });
            r ? I.event.trigger(i, null, t) : I.event.dispatch.call(t, i), i.isDefaultPrevented() && n.preventDefault()
        }
    }, I.event.handle = I.event.dispatch, I.removeEvent = q.removeEventListener ? function(e, t, n) {
        e.removeEventListener && e.removeEventListener(t, n, !1)
    } : function(e, t, n) {
        e.detachEvent && e.detachEvent("on" + t, n)
    }, I.Event = function(e, t) {
        return this instanceof I.Event ? (e && e.type ? (this.originalEvent = e, this.type = e.type, this.isDefaultPrevented = e.defaultPrevented || e.returnValue === !1 || e.getPreventDefault && e.getPreventDefault() ? s : a) : this.type = e, t && I.extend(this, t), this.timeStamp = e && e.timeStamp || I.now(), void(this[I.expando] = !0)) : new I.Event(e, t)
    }, I.Event.prototype = {
        preventDefault: function() {
            this.isDefaultPrevented = s;
            var e = this.originalEvent;
            e && (e.preventDefault ? e.preventDefault() : e.returnValue = !1)
        },
        stopPropagation: function() {
            this.isPropagationStopped = s;
            var e = this.originalEvent;
            e && (e.stopPropagation && e.stopPropagation(), e.cancelBubble = !0)
        },
        stopImmediatePropagation: function() {
            this.isImmediatePropagationStopped = s, this.stopPropagation()
        },
        isDefaultPrevented: a,
        isPropagationStopped: a,
        isImmediatePropagationStopped: a
    }, I.each({
        mouseenter: "mouseover",
        mouseleave: "mouseout"
    }, function(e, t) {
        I.event.special[e] = {
            delegateType: t,
            bindType: t,
            handle: function(e) {
                {
                    var n, r = this,
                        i = e.relatedTarget,
                        o = e.handleObj;
                    o.selector
                }
                return (!i || i !== r && !I.contains(r, i)) && (e.type = o.origType, n = o.handler.apply(this, arguments), e.type = t), n
            }
        }
    }), I.support.submitBubbles || (I.event.special.submit = {
        setup: function() {
            return I.nodeName(this, "form") ? !1 : void I.event.add(this, "click._submit keypress._submit", function(e) {
                var n = e.target,
                    r = I.nodeName(n, "input") || I.nodeName(n, "button") ? n.form : t;
                r && !r._submit_attached && (I.event.add(r, "submit._submit", function(e) {
                    e._submit_bubble = !0
                }), r._submit_attached = !0)
            })
        },
        postDispatch: function(e) {
            e._submit_bubble && (delete e._submit_bubble, this.parentNode && !e.isTrigger && I.event.simulate("submit", this.parentNode, e, !0))
        },
        teardown: function() {
            return I.nodeName(this, "form") ? !1 : void I.event.remove(this, "._submit")
        }
    }), I.support.changeBubbles || (I.event.special.change = {
        setup: function() {
            return Q.test(this.nodeName) ? (("checkbox" === this.type || "radio" === this.type) && (I.event.add(this, "propertychange._change", function(e) {
                "checked" === e.originalEvent.propertyName && (this._just_changed = !0)
            }), I.event.add(this, "click._change", function(e) {
                this._just_changed && !e.isTrigger && (this._just_changed = !1, I.event.simulate("change", this, e, !0))
            })), !1) : void I.event.add(this, "beforeactivate._change", function(e) {
                var t = e.target;
                Q.test(t.nodeName) && !t._change_attached && (I.event.add(t, "change._change", function(e) {
                    !this.parentNode || e.isSimulated || e.isTrigger || I.event.simulate("change", this.parentNode, e, !0)
                }), t._change_attached = !0)
            })
        },
        handle: function(e) {
            var t = e.target;
            return this !== t || e.isSimulated || e.isTrigger || "radio" !== t.type && "checkbox" !== t.type ? e.handleObj.handler.apply(this, arguments) : void 0
        },
        teardown: function() {
            return I.event.remove(this, "._change"), Q.test(this.nodeName)
        }
    }), I.support.focusinBubbles || I.each({
        focus: "focusin",
        blur: "focusout"
    }, function(e, t) {
        var n = 0,
            r = function(e) {
                I.event.simulate(t, e.target, I.event.fix(e), !0)
            };
        I.event.special[t] = {
            setup: function() {
                0 === n++ && q.addEventListener(e, r, !0)
            },
            teardown: function() {
                0 === --n && q.removeEventListener(e, r, !0)
            }
        }
    }), I.fn.extend({
        on: function(e, n, r, i, o) {
            var s, c;
            if ("object" == typeof e) {
                "string" != typeof n && (r = r || n, n = t);
                for (c in e) this.on(c, n, r, e[c], o);
                return this
            }
            if (null == r && null == i ? (i = n, r = n = t) : null == i && ("string" == typeof n ? (i = r, r = t) : (i = r, r = n, n = t)), i === !1) i = a;
            else if (!i) return this;
            return 1 === o && (s = i, i = function(e) {
                return I().off(e), s.apply(this, arguments)
            }, i.guid = s.guid || (s.guid = I.guid++)), this.each(function() {
                I.event.add(this, e, i, r, n)
            })
        },
        one: function(e, t, n, r) {
            return this.on(e, t, n, r, 1)
        },
        off: function(e, n, r) {
            if (e && e.preventDefault && e.handleObj) {
                var i = e.handleObj;
                return I(e.delegateTarget).off(i.namespace ? i.origType + "." + i.namespace : i.origType, i.selector, i.handler), this
            }
            if ("object" == typeof e) {
                for (var o in e) this.off(o, n, e[o]);
                return this
            }
            return (n === !1 || "function" == typeof n) && (r = n, n = t), r === !1 && (r = a), this.each(function() {
                I.event.remove(this, e, r, n)
            })
        },
        bind: function(e, t, n) {
            return this.on(e, null, t, n)
        },
        unbind: function(e, t) {
            return this.off(e, null, t)
        },
        live: function(e, t, n) {
            return I(this.context).on(e, this.selector, t, n), this
        },
        die: function(e, t) {
            return I(this.context).off(e, this.selector || "**", t), this
        },
        delegate: function(e, t, n, r) {
            return this.on(t, e, n, r)
        },
        undelegate: function(e, t, n) {
            return 1 == arguments.length ? this.off(e, "**") : this.off(t, e, n)
        },
        trigger: function(e, t) {
            return this.each(function() {
                I.event.trigger(e, t, this)
            })
        },
        triggerHandler: function(e, t) {
            return this[0] ? I.event.trigger(e, t, this[0], !0) : void 0
        },
        toggle: function(e) {
            var t = arguments,
                n = e.guid || I.guid++,
                r = 0,
                i = function(n) {
                    var i = (I._data(this, "lastToggle" + e.guid) || 0) % r;
                    return I._data(this, "lastToggle" + e.guid, i + 1), n.preventDefault(), t[i].apply(this, arguments) || !1
                };
            for (i.guid = n; r < t.length;) t[r++].guid = n;
            return this.click(i)
        },
        hover: function(e, t) {
            return this.mouseenter(e).mouseleave(t || e)
        }
    }), I.each("blur focus focusin focusout load resize scroll unload click dblclick mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave change select submit keydown keypress keyup error contextmenu".split(" "), function(e, t) {
        I.fn[t] = function(e, n) {
            return null == n && (n = e, e = null), arguments.length > 0 ? this.on(t, null, e, n) : this.trigger(t)
        }, I.attrFn && (I.attrFn[t] = !0), et.test(t) && (I.event.fixHooks[t] = I.event.keyHooks), tt.test(t) && (I.event.fixHooks[t] = I.event.mouseHooks)
    }),
        function() {
            function e(e, t, n, r, o, a) {
                for (var s = 0, c = r.length; c > s; s++) {
                    var l = r[s];
                    if (l) {
                        var u = !1;
                        for (l = l[e]; l;) {
                            if (l[i] === n) {
                                u = r[l.sizset];
                                break
                            }
                            if (1 !== l.nodeType || a || (l[i] = n, l.sizset = s), l.nodeName.toLowerCase() === t) {
                                u = l;
                                break
                            }
                            l = l[e]
                        }
                        r[s] = u
                    }
                }
            }

            function n(e, t, n, r, o, a) {
                for (var s = 0, c = r.length; c > s; s++) {
                    var l = r[s];
                    if (l) {
                        var u = !1;
                        for (l = l[e]; l;) {
                            if (l[i] === n) {
                                u = r[l.sizset];
                                break
                            }
                            if (1 === l.nodeType)
                                if (a || (l[i] = n, l.sizset = s), "string" != typeof t) {
                                    if (l === t) {
                                        u = !0;
                                        break
                                    }
                                } else if (f.filter(t, [l]).length > 0) {
                                    u = l;
                                    break
                                }
                            l = l[e]
                        }
                        r[s] = u
                    }
                }
            }
            var r = /((?:\((?:\([^()]+\)|[^()]+)+\)|\[(?:\[[^\[\]]*\]|['"][^'"]*['"]|[^\[\]'"]+)+\]|\\.|[^ >+~,(\[\\]+)+|[>+~])(\s*,\s*)?((?:.|\r|\n)*)/g,
                i = "sizcache" + (Math.random() + "").replace(".", ""),
                o = 0,
                a = Object.prototype.toString,
                s = !1,
                c = !0,
                l = /\\/g,
                u = /\r\n/g,
                d = /\W/;
            [0, 0].sort(function() {
                return c = !1, 0
            });
            var f = function(e, t, n, i) {
                n = n || [], t = t || q;
                var o = t;
                if (1 !== t.nodeType && 9 !== t.nodeType) return [];
                if (!e || "string" != typeof e) return n;
                var s, c, l, u, d, p, m, v, b = !0,
                    $ = f.isXML(t),
                    w = [],
                    x = e;
                do
                    if (r.exec(""), s = r.exec(x), s && (x = s[3], w.push(s[1]), s[2])) {
                        u = s[3];
                        break
                    } while (s);
                if (w.length > 1 && g.exec(e))
                    if (2 === w.length && h.relative[w[0]]) c = k(w[0] + w[1], t, i);
                    else
                        for (c = h.relative[w[0]] ? [t] : f(w.shift(), t); w.length;) e = w.shift(), h.relative[e] && (e += w.shift()), c = k(e, c, i);
                else if (!i && w.length > 1 && 9 === t.nodeType && !$ && h.match.ID.test(w[0]) && !h.match.ID.test(w[w.length - 1]) && (d = f.find(w.shift(), t, $), t = d.expr ? f.filter(d.expr, d.set)[0] : d.set[0]), t)
                    for (d = i ? {
                        expr: w.pop(),
                        set: y(i)
                    } : f.find(w.pop(), 1 !== w.length || "~" !== w[0] && "+" !== w[0] || !t.parentNode ? t : t.parentNode, $), c = d.expr ? f.filter(d.expr, d.set) : d.set, w.length > 0 ? l = y(c) : b = !1; w.length;) p = w.pop(), m = p, h.relative[p] ? m = w.pop() : p = "", null == m && (m = t), h.relative[p](l, m, $);
                else l = w = []; if (l || (l = c), l || f.error(p || e), "[object Array]" === a.call(l))
                    if (b)
                        if (t && 1 === t.nodeType)
                            for (v = 0; null != l[v]; v++) l[v] && (l[v] === !0 || 1 === l[v].nodeType && f.contains(t, l[v])) && n.push(c[v]);
                        else
                            for (v = 0; null != l[v]; v++) l[v] && 1 === l[v].nodeType && n.push(c[v]);
                    else n.push.apply(n, l);
                else y(l, n);
                return u && (f(u, o, n, i), f.uniqueSort(n)), n
            };
            f.uniqueSort = function(e) {
                if ($ && (s = c, e.sort($), s))
                    for (var t = 1; t < e.length; t++) e[t] === e[t - 1] && e.splice(t--, 1);
                return e
            }, f.matches = function(e, t) {
                return f(e, null, null, t)
            }, f.matchesSelector = function(e, t) {
                return f(t, null, null, [e]).length > 0
            }, f.find = function(e, t, n) {
                var r, i, o, a, s, c;
                if (!e) return [];
                for (i = 0, o = h.order.length; o > i; i++)
                    if (s = h.order[i], (a = h.leftMatch[s].exec(e)) && (c = a[1], a.splice(1, 1), "\\" !== c.substr(c.length - 1) && (a[1] = (a[1] || "").replace(l, ""), r = h.find[s](a, t, n), null != r))) {
                        e = e.replace(h.match[s], "");
                        break
                    }
                return r || (r = "undefined" != typeof t.getElementsByTagName ? t.getElementsByTagName("*") : []), {
                    set: r,
                    expr: e
                }
            }, f.filter = function(e, n, r, i) {
                for (var o, a, s, c, l, u, d, p, g, m = e, v = [], y = n, b = n && n[0] && f.isXML(n[0]); e && n.length;) {
                    for (s in h.filter)
                        if (null != (o = h.leftMatch[s].exec(e)) && o[2]) {
                            if (u = h.filter[s], d = o[1], a = !1, o.splice(1, 1), "\\" === d.substr(d.length - 1)) continue;
                            if (y === v && (v = []), h.preFilter[s])
                                if (o = h.preFilter[s](o, y, r, v, i, b)) {
                                    if (o === !0) continue
                                } else a = c = !0;
                            if (o)
                                for (p = 0; null != (l = y[p]); p++) l && (c = u(l, o, p, y), g = i ^ c, r && null != c ? g ? a = !0 : y[p] = !1 : g && (v.push(l), a = !0));
                            if (c !== t) {
                                if (r || (y = v), e = e.replace(h.match[s], ""), !a) return [];
                                break
                            }
                        }
                    if (e === m) {
                        if (null != a) break;
                        f.error(e)
                    }
                    m = e
                }
                return y
            }, f.error = function(e) {
                throw new Error("Syntax error, unrecognized expression: " + e)
            };
            var p = f.getText = function(e) {
                    var t, n, r = e.nodeType,
                        i = "";
                    if (r) {
                        if (1 === r || 9 === r || 11 === r) {
                            if ("string" == typeof e.textContent) return e.textContent;
                            if ("string" == typeof e.innerText) return e.innerText.replace(u, "");
                            for (e = e.firstChild; e; e = e.nextSibling) i += p(e)
                        } else if (3 === r || 4 === r) return e.nodeValue
                    } else
                        for (t = 0; n = e[t]; t++) 8 !== n.nodeType && (i += p(n));
                    return i
                }, h = f.selectors = {
                    order: ["ID", "NAME", "TAG"],
                    match: {
                        ID: /#((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                        CLASS: /\.((?:[\w\u00c0-\uFFFF\-]|\\.)+)/,
                        NAME: /\[name=['"]*((?:[\w\u00c0-\uFFFF\-]|\\.)+)['"]*\]/,
                        ATTR: /\[\s*((?:[\w\u00c0-\uFFFF\-]|\\.)+)\s*(?:(\S?=)\s*(?:(['"])(.*?)\3|(#?(?:[\w\u00c0-\uFFFF\-]|\\.)*)|)|)\s*\]/,
                        TAG: /^((?:[\w\u00c0-\uFFFF\*\-]|\\.)+)/,
                        CHILD: /:(only|nth|last|first)-child(?:\(\s*(even|odd|(?:[+\-]?\d+|(?:[+\-]?\d*)?n\s*(?:[+\-]\s*\d+)?))\s*\))?/,
                        POS: /:(nth|eq|gt|lt|first|last|even|odd)(?:\((\d*)\))?(?=[^\-]|$)/,
                        PSEUDO: /:((?:[\w\u00c0-\uFFFF\-]|\\.)+)(?:\((['"]?)((?:\([^\)]+\)|[^\(\)]*)+)\2\))?/
                    },
                    leftMatch: {},
                    attrMap: {
                        "class": "className",
                        "for": "htmlFor"
                    },
                    attrHandle: {
                        href: function(e) {
                            return e.getAttribute("href")
                        },
                        type: function(e) {
                            return e.getAttribute("type")
                        }
                    },
                    relative: {
                        "+": function(e, t) {
                            var n = "string" == typeof t,
                                r = n && !d.test(t),
                                i = n && !r;
                            r && (t = t.toLowerCase());
                            for (var o, a = 0, s = e.length; s > a; a++)
                                if (o = e[a]) {
                                    for (;
                                        (o = o.previousSibling) && 1 !== o.nodeType;);
                                    e[a] = i || o && o.nodeName.toLowerCase() === t ? o || !1 : o === t
                                }
                            i && f.filter(t, e, !0)
                        },
                        ">": function(e, t) {
                            var n, r = "string" == typeof t,
                                i = 0,
                                o = e.length;
                            if (r && !d.test(t)) {
                                for (t = t.toLowerCase(); o > i; i++)
                                    if (n = e[i]) {
                                        var a = n.parentNode;
                                        e[i] = a.nodeName.toLowerCase() === t ? a : !1
                                    }
                            } else {
                                for (; o > i; i++) n = e[i], n && (e[i] = r ? n.parentNode : n.parentNode === t);
                                r && f.filter(t, e, !0)
                            }
                        },
                        "": function(t, r, i) {
                            var a, s = o++,
                                c = n;
                            "string" != typeof r || d.test(r) || (r = r.toLowerCase(), a = r, c = e), c("parentNode", r, s, t, a, i)
                        },
                        "~": function(t, r, i) {
                            var a, s = o++,
                                c = n;
                            "string" != typeof r || d.test(r) || (r = r.toLowerCase(), a = r, c = e), c("previousSibling", r, s, t, a, i)
                        }
                    },
                    find: {
                        ID: function(e, t, n) {
                            if ("undefined" != typeof t.getElementById && !n) {
                                var r = t.getElementById(e[1]);
                                return r && r.parentNode ? [r] : []
                            }
                        },
                        NAME: function(e, t) {
                            if ("undefined" != typeof t.getElementsByName) {
                                for (var n = [], r = t.getElementsByName(e[1]), i = 0, o = r.length; o > i; i++) r[i].getAttribute("name") === e[1] && n.push(r[i]);
                                return 0 === n.length ? null : n
                            }
                        },
                        TAG: function(e, t) {
                            return "undefined" != typeof t.getElementsByTagName ? t.getElementsByTagName(e[1]) : void 0
                        }
                    },
                    preFilter: {
                        CLASS: function(e, t, n, r, i, o) {
                            if (e = " " + e[1].replace(l, "") + " ", o) return e;
                            for (var a, s = 0; null != (a = t[s]); s++) a && (i ^ (a.className && (" " + a.className + " ").replace(/[\t\n\r]/g, " ").indexOf(e) >= 0) ? n || r.push(a) : n && (t[s] = !1));
                            return !1
                        },
                        ID: function(e) {
                            return e[1].replace(l, "")
                        },
                        TAG: function(e) {
                            return e[1].replace(l, "").toLowerCase()
                        },
                        CHILD: function(e) {
                            if ("nth" === e[1]) {
                                e[2] || f.error(e[0]), e[2] = e[2].replace(/^\+|\s*/g, "");
                                var t = /(-?)(\d*)(?:n([+\-]?\d*))?/.exec("even" === e[2] && "2n" || "odd" === e[2] && "2n+1" || !/\D/.test(e[2]) && "0n+" + e[2] || e[2]);
                                e[2] = t[1] + (t[2] || 1) - 0, e[3] = t[3] - 0
                            } else e[2] && f.error(e[0]);
                            return e[0] = o++, e
                        },
                        ATTR: function(e, t, n, r, i, o) {
                            var a = e[1] = e[1].replace(l, "");
                            return !o && h.attrMap[a] && (e[1] = h.attrMap[a]), e[4] = (e[4] || e[5] || "").replace(l, ""), "~=" === e[2] && (e[4] = " " + e[4] + " "), e
                        },
                        PSEUDO: function(e, t, n, i, o) {
                            if ("not" === e[1]) {
                                if (!((r.exec(e[3]) || "").length > 1 || /^\w/.test(e[3]))) {
                                    var a = f.filter(e[3], t, n, !0 ^ o);
                                    return n || i.push.apply(i, a), !1
                                }
                                e[3] = f(e[3], null, null, t)
                            } else if (h.match.POS.test(e[0]) || h.match.CHILD.test(e[0])) return !0;
                            return e
                        },
                        POS: function(e) {
                            return e.unshift(!0), e
                        }
                    },
                    filters: {
                        enabled: function(e) {
                            return e.disabled === !1 && "hidden" !== e.type
                        },
                        disabled: function(e) {
                            return e.disabled === !0
                        },
                        checked: function(e) {
                            return e.checked === !0
                        },
                        selected: function(e) {
                            return e.parentNode && e.parentNode.selectedIndex, e.selected === !0
                        },
                        parent: function(e) {
                            return !!e.firstChild
                        },
                        empty: function(e) {
                            return !e.firstChild
                        },
                        has: function(e, t, n) {
                            return !!f(n[3], e).length
                        },
                        header: function(e) {
                            return /h\d/i.test(e.nodeName)
                        },
                        text: function(e) {
                            var t = e.getAttribute("type"),
                                n = e.type;
                            return "input" === e.nodeName.toLowerCase() && "text" === n && (t === n || null === t)
                        },
                        radio: function(e) {
                            return "input" === e.nodeName.toLowerCase() && "radio" === e.type
                        },
                        checkbox: function(e) {
                            return "input" === e.nodeName.toLowerCase() && "checkbox" === e.type
                        },
                        file: function(e) {
                            return "input" === e.nodeName.toLowerCase() && "file" === e.type
                        },
                        password: function(e) {
                            return "input" === e.nodeName.toLowerCase() && "password" === e.type
                        },
                        submit: function(e) {
                            var t = e.nodeName.toLowerCase();
                            return ("input" === t || "button" === t) && "submit" === e.type
                        },
                        image: function(e) {
                            return "input" === e.nodeName.toLowerCase() && "image" === e.type
                        },
                        reset: function(e) {
                            var t = e.nodeName.toLowerCase();
                            return ("input" === t || "button" === t) && "reset" === e.type
                        },
                        button: function(e) {
                            var t = e.nodeName.toLowerCase();
                            return "input" === t && "button" === e.type || "button" === t
                        },
                        input: function(e) {
                            return /input|select|textarea|button/i.test(e.nodeName)
                        },
                        focus: function(e) {
                            return e === e.ownerDocument.activeElement
                        }
                    },
                    setFilters: {
                        first: function(e, t) {
                            return 0 === t
                        },
                        last: function(e, t, n, r) {
                            return t === r.length - 1
                        },
                        even: function(e, t) {
                            return t % 2 === 0
                        },
                        odd: function(e, t) {
                            return t % 2 === 1
                        },
                        lt: function(e, t, n) {
                            return t < n[3] - 0
                        },
                        gt: function(e, t, n) {
                            return t > n[3] - 0
                        },
                        nth: function(e, t, n) {
                            return n[3] - 0 === t
                        },
                        eq: function(e, t, n) {
                            return n[3] - 0 === t
                        }
                    },
                    filter: {
                        PSEUDO: function(e, t, n, r) {
                            var i = t[1],
                                o = h.filters[i];
                            if (o) return o(e, n, t, r);
                            if ("contains" === i) return (e.textContent || e.innerText || p([e]) || "").indexOf(t[3]) >= 0;
                            if ("not" === i) {
                                for (var a = t[3], s = 0, c = a.length; c > s; s++)
                                    if (a[s] === e) return !1;
                                return !0
                            }
                            f.error(i)
                        },
                        CHILD: function(e, t) {
                            var n, r, o, a, s, c, l = t[1],
                                u = e;
                            switch (l) {
                                case "only":
                                case "first":
                                    for (; u = u.previousSibling;)
                                        if (1 === u.nodeType) return !1;
                                    if ("first" === l) return !0;
                                    u = e;
                                case "last":
                                    for (; u = u.nextSibling;)
                                        if (1 === u.nodeType) return !1;
                                    return !0;
                                case "nth":
                                    if (n = t[2], r = t[3], 1 === n && 0 === r) return !0;
                                    if (o = t[0], a = e.parentNode, a && (a[i] !== o || !e.nodeIndex)) {
                                        for (s = 0, u = a.firstChild; u; u = u.nextSibling) 1 === u.nodeType && (u.nodeIndex = ++s);
                                        a[i] = o
                                    }
                                    return c = e.nodeIndex - r, 0 === n ? 0 === c : c % n === 0 && c / n >= 0
                            }
                        },
                        ID: function(e, t) {
                            return 1 === e.nodeType && e.getAttribute("id") === t
                        },
                        TAG: function(e, t) {
                            return "*" === t && 1 === e.nodeType || !! e.nodeName && e.nodeName.toLowerCase() === t
                        },
                        CLASS: function(e, t) {
                            return (" " + (e.className || e.getAttribute("class")) + " ").indexOf(t) > -1
                        },
                        ATTR: function(e, t) {
                            var n = t[1],
                                r = f.attr ? f.attr(e, n) : h.attrHandle[n] ? h.attrHandle[n](e) : null != e[n] ? e[n] : e.getAttribute(n),
                                i = r + "",
                                o = t[2],
                                a = t[4];
                            return null == r ? "!=" === o : !o && f.attr ? null != r : "=" === o ? i === a : "*=" === o ? i.indexOf(a) >= 0 : "~=" === o ? (" " + i + " ").indexOf(a) >= 0 : a ? "!=" === o ? i !== a : "^=" === o ? 0 === i.indexOf(a) : "$=" === o ? i.substr(i.length - a.length) === a : "|=" === o ? i === a || i.substr(0, a.length + 1) === a + "-" : !1 : i && r !== !1
                        },
                        POS: function(e, t, n, r) {
                            var i = t[2],
                                o = h.setFilters[i];
                            return o ? o(e, n, t, r) : void 0
                        }
                    }
                }, g = h.match.POS,
                m = function(e, t) {
                    return "\\" + (t - 0 + 1)
                };
            for (var v in h.match) h.match[v] = new RegExp(h.match[v].source + /(?![^\[]*\])(?![^\(]*\))/.source), h.leftMatch[v] = new RegExp(/(^(?:.|\r|\n)*?)/.source + h.match[v].source.replace(/\\(\d+)/g, m));
            h.match.globalPOS = g;
            var y = function(e, t) {
                return e = Array.prototype.slice.call(e, 0), t ? (t.push.apply(t, e), t) : e
            };
            try {
                Array.prototype.slice.call(q.documentElement.childNodes, 0)[0].nodeType
            } catch (b) {
                y = function(e, t) {
                    var n = 0,
                        r = t || [];
                    if ("[object Array]" === a.call(e)) Array.prototype.push.apply(r, e);
                    else if ("number" == typeof e.length)
                        for (var i = e.length; i > n; n++) r.push(e[n]);
                    else
                        for (; e[n]; n++) r.push(e[n]);
                    return r
                }
            }
            var $, w;
            q.documentElement.compareDocumentPosition ? $ = function(e, t) {
                return e === t ? (s = !0, 0) : e.compareDocumentPosition && t.compareDocumentPosition ? 4 & e.compareDocumentPosition(t) ? -1 : 1 : e.compareDocumentPosition ? -1 : 1
            } : ($ = function(e, t) {
                if (e === t) return s = !0, 0;
                if (e.sourceIndex && t.sourceIndex) return e.sourceIndex - t.sourceIndex;
                var n, r, i = [],
                    o = [],
                    a = e.parentNode,
                    c = t.parentNode,
                    l = a;
                if (a === c) return w(e, t);
                if (!a) return -1;
                if (!c) return 1;
                for (; l;) i.unshift(l), l = l.parentNode;
                for (l = c; l;) o.unshift(l), l = l.parentNode;
                n = i.length, r = o.length;
                for (var u = 0; n > u && r > u; u++)
                    if (i[u] !== o[u]) return w(i[u], o[u]);
                return u === n ? w(e, o[u], -1) : w(i[u], t, 1)
            }, w = function(e, t, n) {
                if (e === t) return n;
                for (var r = e.nextSibling; r;) {
                    if (r === t) return -1;
                    r = r.nextSibling
                }
                return 1
            }),
                function() {
                    var e = q.createElement("div"),
                        n = "script" + (new Date).getTime(),
                        r = q.documentElement;
                    e.innerHTML = "<a name='" + n + "'/>", r.insertBefore(e, r.firstChild), q.getElementById(n) && (h.find.ID = function(e, n, r) {
                        if ("undefined" != typeof n.getElementById && !r) {
                            var i = n.getElementById(e[1]);
                            return i ? i.id === e[1] || "undefined" != typeof i.getAttributeNode && i.getAttributeNode("id").nodeValue === e[1] ? [i] : t : []
                        }
                    }, h.filter.ID = function(e, t) {
                        var n = "undefined" != typeof e.getAttributeNode && e.getAttributeNode("id");
                        return 1 === e.nodeType && n && n.nodeValue === t
                    }), r.removeChild(e), r = e = null
                }(),
                function() {
                    var e = q.createElement("div");
                    e.appendChild(q.createComment("")), e.getElementsByTagName("*").length > 0 && (h.find.TAG = function(e, t) {
                        var n = t.getElementsByTagName(e[1]);
                        if ("*" === e[1]) {
                            for (var r = [], i = 0; n[i]; i++) 1 === n[i].nodeType && r.push(n[i]);
                            n = r
                        }
                        return n
                    }), e.innerHTML = "<a href='#'></a>", e.firstChild && "undefined" != typeof e.firstChild.getAttribute && "#" !== e.firstChild.getAttribute("href") && (h.attrHandle.href = function(e) {
                        return e.getAttribute("href", 2)
                    }), e = null
                }(), q.querySelectorAll && ! function() {
                var e = f,
                    t = q.createElement("div"),
                    n = "__sizzle__";
                if (t.innerHTML = "<p class='TEST'></p>", !t.querySelectorAll || 0 !== t.querySelectorAll(".TEST").length) {
                    f = function(t, r, i, o) {
                        if (r = r || q, !o && !f.isXML(r)) {
                            var a = /^(\w+$)|^\.([\w\-]+$)|^#([\w\-]+$)/.exec(t);
                            if (a && (1 === r.nodeType || 9 === r.nodeType)) {
                                if (a[1]) return y(r.getElementsByTagName(t), i);
                                if (a[2] && h.find.CLASS && r.getElementsByClassName) return y(r.getElementsByClassName(a[2]), i)
                            }
                            if (9 === r.nodeType) {
                                if ("body" === t && r.body) return y([r.body], i);
                                if (a && a[3]) {
                                    var s = r.getElementById(a[3]);
                                    if (!s || !s.parentNode) return y([], i);
                                    if (s.id === a[3]) return y([s], i)
                                }
                                try {
                                    return y(r.querySelectorAll(t), i)
                                } catch (c) {}
                            } else if (1 === r.nodeType && "object" !== r.nodeName.toLowerCase()) {
                                var l = r,
                                    u = r.getAttribute("id"),
                                    d = u || n,
                                    p = r.parentNode,
                                    g = /^\s*[+~]/.test(t);
                                u ? d = d.replace(/'/g, "\\$&") : r.setAttribute("id", d), g && p && (r = r.parentNode);
                                try {
                                    if (!g || p) return y(r.querySelectorAll("[id='" + d + "'] " + t), i)
                                } catch (m) {} finally {
                                    u || l.removeAttribute("id")
                                }
                            }
                        }
                        return e(t, r, i, o)
                    };
                    for (var r in e) f[r] = e[r];
                    t = null
                }
            }(),
                function() {
                    var e = q.documentElement,
                        t = e.matchesSelector || e.mozMatchesSelector || e.webkitMatchesSelector || e.msMatchesSelector;
                    if (t) {
                        var n = !t.call(q.createElement("div"), "div"),
                            r = !1;
                        try {
                            t.call(q.documentElement, "[test!='']:sizzle")
                        } catch (i) {
                            r = !0
                        }
                        f.matchesSelector = function(e, i) {
                            if (i = i.replace(/\=\s*([^'"\]]*)\s*\]/g, "='$1']"), !f.isXML(e)) try {
                                if (r || !h.match.PSEUDO.test(i) && !/!=/.test(i)) {
                                    var o = t.call(e, i);
                                    if (o || !n || e.document && 11 !== e.document.nodeType) return o
                                }
                            } catch (a) {}
                            return f(i, null, null, [e]).length > 0
                        }
                    }
                }(),
                function() {
                    var e = q.createElement("div");
                    e.innerHTML = "<div class='test e'></div><div class='test'></div>", e.getElementsByClassName && 0 !== e.getElementsByClassName("e").length && (e.lastChild.className = "e", 1 !== e.getElementsByClassName("e").length && (h.order.splice(1, 0, "CLASS"), h.find.CLASS = function(e, t, n) {
                        return "undefined" == typeof t.getElementsByClassName || n ? void 0 : t.getElementsByClassName(e[1])
                    }, e = null))
                }(), f.contains = q.documentElement.contains ? function(e, t) {
                return e !== t && (e.contains ? e.contains(t) : !0)
            } : q.documentElement.compareDocumentPosition ? function(e, t) {
                return !!(16 & e.compareDocumentPosition(t))
            } : function() {
                return !1
            }, f.isXML = function(e) {
                var t = (e ? e.ownerDocument || e : 0).documentElement;
                return t ? "HTML" !== t.nodeName : !1
            };
            var k = function(e, t, n) {
                for (var r, i = [], o = "", a = t.nodeType ? [t] : t; r = h.match.PSEUDO.exec(e);) o += r[0], e = e.replace(h.match.PSEUDO, "");
                e = h.relative[e] ? e + "*" : e;
                for (var s = 0, c = a.length; c > s; s++) f(e, a[s], i, n);
                return f.filter(o, i)
            };
            f.attr = I.attr, f.selectors.attrMap = {}, I.find = f, I.expr = f.selectors, I.expr[":"] = I.expr.filters, I.unique = f.uniqueSort, I.text = f.getText, I.isXMLDoc = f.isXML, I.contains = f.contains
        }();
    var st = /Until$/,
        ct = /^(?:parents|prevUntil|prevAll)/,
        lt = /,/,
        ut = /^.[^:#\[\.,]*$/,
        dt = Array.prototype.slice,
        ft = I.expr.match.globalPOS,
        pt = {
            children: !0,
            contents: !0,
            next: !0,
            prev: !0
        };
    I.fn.extend({
        find: function(e) {
            var t, n, r = this;
            if ("string" != typeof e) return I(e).filter(function() {
                for (t = 0, n = r.length; n > t; t++)
                    if (I.contains(r[t], this)) return !0
            });
            var i, o, a, s = this.pushStack("", "find", e);
            for (t = 0, n = this.length; n > t; t++)
                if (i = s.length, I.find(e, this[t], s), t > 0)
                    for (o = i; o < s.length; o++)
                        for (a = 0; i > a; a++)
                            if (s[a] === s[o]) {
                                s.splice(o--, 1);
                                break
                            }
            return s
        },
        has: function(e) {
            var t = I(e);
            return this.filter(function() {
                for (var e = 0, n = t.length; n > e; e++)
                    if (I.contains(this, t[e])) return !0
            })
        },
        not: function(e) {
            return this.pushStack(l(this, e, !1), "not", e)
        },
        filter: function(e) {
            return this.pushStack(l(this, e, !0), "filter", e)
        },
        is: function(e) {
            return !!e && ("string" == typeof e ? ft.test(e) ? I(e, this.context).index(this[0]) >= 0 : I.filter(e, this).length > 0 : this.filter(e).length > 0)
        },
        closest: function(e, t) {
            var n, r, i = [],
                o = this[0];
            if (I.isArray(e)) {
                for (var a = 1; o && o.ownerDocument && o !== t;) {
                    for (n = 0; n < e.length; n++) I(o).is(e[n]) && i.push({
                        selector: e[n],
                        elem: o,
                        level: a
                    });
                    o = o.parentNode, a++
                }
                return i
            }
            var s = ft.test(e) || "string" != typeof e ? I(e, t || this.context) : 0;
            for (n = 0, r = this.length; r > n; n++)
                for (o = this[n]; o;) {
                    if (s ? s.index(o) > -1 : I.find.matchesSelector(o, e)) {
                        i.push(o);
                        break
                    }
                    if (o = o.parentNode, !o || !o.ownerDocument || o === t || 11 === o.nodeType) break
                }
            return i = i.length > 1 ? I.unique(i) : i, this.pushStack(i, "closest", e)
        },
        index: function(e) {
            return e ? "string" == typeof e ? I.inArray(this[0], I(e)) : I.inArray(e.jquery ? e[0] : e, this) : this[0] && this[0].parentNode ? this.prevAll().length : -1
        },
        add: function(e, t) {
            var n = "string" == typeof e ? I(e, t) : I.makeArray(e && e.nodeType ? [e] : e),
                r = I.merge(this.get(), n);
            return this.pushStack(c(n[0]) || c(r[0]) ? r : I.unique(r))
        },
        andSelf: function() {
            return this.add(this.prevObject)
        }
    }), I.each({
        parent: function(e) {
            var t = e.parentNode;
            return t && 11 !== t.nodeType ? t : null
        },
        parents: function(e) {
            return I.dir(e, "parentNode")
        },
        parentsUntil: function(e, t, n) {
            return I.dir(e, "parentNode", n)
        },
        next: function(e) {
            return I.nth(e, 2, "nextSibling")
        },
        prev: function(e) {
            return I.nth(e, 2, "previousSibling")
        },
        nextAll: function(e) {
            return I.dir(e, "nextSibling")
        },
        prevAll: function(e) {
            return I.dir(e, "previousSibling")
        },
        nextUntil: function(e, t, n) {
            return I.dir(e, "nextSibling", n)
        },
        prevUntil: function(e, t, n) {
            return I.dir(e, "previousSibling", n)
        },
        siblings: function(e) {
            return I.sibling((e.parentNode || {}).firstChild, e)
        },
        children: function(e) {
            return I.sibling(e.firstChild)
        },
        contents: function(e) {
            return I.nodeName(e, "iframe") ? e.contentDocument || e.contentWindow.document : I.makeArray(e.childNodes)
        }
    }, function(e, t) {
        I.fn[e] = function(n, r) {
            var i = I.map(this, t, n);
            return st.test(e) || (r = n), r && "string" == typeof r && (i = I.filter(r, i)), i = this.length > 1 && !pt[e] ? I.unique(i) : i, (this.length > 1 || lt.test(r)) && ct.test(e) && (i = i.reverse()), this.pushStack(i, e, dt.call(arguments).join(","))
        }
    }), I.extend({
        filter: function(e, t, n) {
            return n && (e = ":not(" + e + ")"), 1 === t.length ? I.find.matchesSelector(t[0], e) ? [t[0]] : [] : I.find.matches(e, t)
        },
        dir: function(e, n, r) {
            for (var i = [], o = e[n]; o && 9 !== o.nodeType && (r === t || 1 !== o.nodeType || !I(o).is(r));) 1 === o.nodeType && i.push(o), o = o[n];
            return i
        },
        nth: function(e, t, n) {
            t = t || 1;
            for (var r = 0; e && (1 !== e.nodeType || ++r !== t); e = e[n]);
            return e
        },
        sibling: function(e, t) {
            for (var n = []; e; e = e.nextSibling) 1 === e.nodeType && e !== t && n.push(e);
            return n
        }
    });
    var ht = "abbr|article|aside|audio|bdi|canvas|data|datalist|details|figcaption|figure|footer|header|hgroup|mark|meter|nav|output|progress|section|summary|time|video",
        gt = / jQuery\d+="(?:\d+|null)"/g,
        mt = /^\s+/,
        vt = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
        yt = /<([\w:]+)/,
        bt = /<tbody/i,
        $t = /<|&#?\w+;/,
        wt = /<(?:script|style)/i,
        kt = /<(?:script|object|embed|option|style)/i,
        xt = new RegExp("<(?:" + ht + ")[\\s/>]", "i"),
        Tt = /checked\s*(?:[^=]|=\s*.checked.)/i,
        Ct = /\/(java|ecma)script/i,
        St = /^\s*<!(?:\[CDATA\[|\-\-)/,
        At = {
            option: [1, "<select multiple='multiple'>", "</select>"],
            legend: [1, "<fieldset>", "</fieldset>"],
            thead: [1, "<table>", "</table>"],
            tr: [2, "<table><tbody>", "</tbody></table>"],
            td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
            col: [2, "<table><tbody></tbody><colgroup>", "</colgroup></table>"],
            area: [1, "<map>", "</map>"],
            _default: [0, "", ""]
        }, Et = u(q);
    At.optgroup = At.option, At.tbody = At.tfoot = At.colgroup = At.caption = At.thead, At.th = At.td, I.support.htmlSerialize || (At._default = [1, "div<div>", "</div>"]), I.fn.extend({
        text: function(e) {
            return I.access(this, function(e) {
                return e === t ? I.text(this) : this.empty().append((this[0] && this[0].ownerDocument || q).createTextNode(e))
            }, null, e, arguments.length)
        },
        wrapAll: function(e) {
            if (I.isFunction(e)) return this.each(function(t) {
                I(this).wrapAll(e.call(this, t))
            });
            if (this[0]) {
                var t = I(e, this[0].ownerDocument).eq(0).clone(!0);
                this[0].parentNode && t.insertBefore(this[0]), t.map(function() {
                    for (var e = this; e.firstChild && 1 === e.firstChild.nodeType;) e = e.firstChild;
                    return e
                }).append(this)
            }
            return this
        },
        wrapInner: function(e) {
            return this.each(I.isFunction(e) ? function(t) {
                I(this).wrapInner(e.call(this, t))
            } : function() {
                var t = I(this),
                    n = t.contents();
                n.length ? n.wrapAll(e) : t.append(e)
            })
        },
        wrap: function(e) {
            var t = I.isFunction(e);
            return this.each(function(n) {
                I(this).wrapAll(t ? e.call(this, n) : e)
            })
        },
        unwrap: function() {
            return this.parent().each(function() {
                I.nodeName(this, "body") || I(this).replaceWith(this.childNodes)
            }).end()
        },
        append: function() {
            return this.domManip(arguments, !0, function(e) {
                1 === this.nodeType && this.appendChild(e)
            })
        },
        prepend: function() {
            return this.domManip(arguments, !0, function(e) {
                1 === this.nodeType && this.insertBefore(e, this.firstChild)
            })
        },
        before: function() {
            if (this[0] && this[0].parentNode) return this.domManip(arguments, !1, function(e) {
                this.parentNode.insertBefore(e, this)
            });
            if (arguments.length) {
                var e = I.clean(arguments);
                return e.push.apply(e, this.toArray()), this.pushStack(e, "before", arguments)
            }
        },
        after: function() {
            if (this[0] && this[0].parentNode) return this.domManip(arguments, !1, function(e) {
                this.parentNode.insertBefore(e, this.nextSibling)
            });
            if (arguments.length) {
                var e = this.pushStack(this, "after", arguments);
                return e.push.apply(e, I.clean(arguments)), e
            }
        },
        remove: function(e, t) {
            for (var n, r = 0; null != (n = this[r]); r++)(!e || I.filter(e, [n]).length) && (t || 1 !== n.nodeType || (I.cleanData(n.getElementsByTagName("*")), I.cleanData([n])), n.parentNode && n.parentNode.removeChild(n));
            return this
        },
        empty: function() {
            for (var e, t = 0; null != (e = this[t]); t++)
                for (1 === e.nodeType && I.cleanData(e.getElementsByTagName("*")); e.firstChild;) e.removeChild(e.firstChild);
            return this
        },
        clone: function(e, t) {
            return e = null == e ? !1 : e, t = null == t ? e : t, this.map(function() {
                return I.clone(this, e, t)
            })
        },
        html: function(e) {
            return I.access(this, function(e) {
                var n = this[0] || {}, r = 0,
                    i = this.length;
                if (e === t) return 1 === n.nodeType ? n.innerHTML.replace(gt, "") : null;
                if (!("string" != typeof e || wt.test(e) || !I.support.leadingWhitespace && mt.test(e) || At[(yt.exec(e) || ["", ""])[1].toLowerCase()])) {
                    e = e.replace(vt, "<$1></$2>");
                    try {
                        for (; i > r; r++) n = this[r] || {}, 1 === n.nodeType && (I.cleanData(n.getElementsByTagName("*")), n.innerHTML = e);
                        n = 0
                    } catch (o) {}
                }
                n && this.empty().append(e)
            }, null, e, arguments.length)
        },
        replaceWith: function(e) {
            return this[0] && this[0].parentNode ? I.isFunction(e) ? this.each(function(t) {
                var n = I(this),
                    r = n.html();
                n.replaceWith(e.call(this, t, r))
            }) : ("string" != typeof e && (e = I(e).detach()), this.each(function() {
                var t = this.nextSibling,
                    n = this.parentNode;
                I(this).remove(), t ? I(t).before(e) : I(n).append(e)
            })) : this.length ? this.pushStack(I(I.isFunction(e) ? e() : e), "replaceWith", e) : this
        },
        detach: function(e) {
            return this.remove(e, !0)
        },
        domManip: function(e, n, r) {
            var i, o, a, s, c = e[0],
                l = [];
            if (!I.support.checkClone && 3 === arguments.length && "string" == typeof c && Tt.test(c)) return this.each(function() {
                I(this).domManip(e, n, r, !0)
            });
            if (I.isFunction(c)) return this.each(function(i) {
                var o = I(this);
                e[0] = c.call(this, i, n ? o.html() : t), o.domManip(e, n, r)
            });
            if (this[0]) {
                if (s = c && c.parentNode, i = I.support.parentNode && s && 11 === s.nodeType && s.childNodes.length === this.length ? {
                    fragment: s
                } : I.buildFragment(e, this, l), a = i.fragment, o = 1 === a.childNodes.length ? a = a.firstChild : a.firstChild) {
                    n = n && I.nodeName(o, "tr");
                    for (var u = 0, f = this.length, p = f - 1; f > u; u++) r.call(n ? d(this[u], o) : this[u], i.cacheable || f > 1 && p > u ? I.clone(a, !0, !0) : a)
                }
                l.length && I.each(l, function(e, t) {
                    t.src ? I.ajax({
                        type: "GET",
                        global: !1,
                        url: t.src,
                        async: !1,
                        dataType: "script"
                    }) : I.globalEval((t.text || t.textContent || t.innerHTML || "").replace(St, "/*$0*/")), t.parentNode && t.parentNode.removeChild(t)
                })
            }
            return this
        }
    }), I.buildFragment = function(e, t, n) {
        var r, i, o, a, s = e[0];
        return t && t[0] && (a = t[0].ownerDocument || t[0]), a.createDocumentFragment || (a = q), !(1 === e.length && "string" == typeof s && s.length < 512 && a === q && "<" === s.charAt(0)) || kt.test(s) || !I.support.checkClone && Tt.test(s) || !I.support.html5Clone && xt.test(s) || (i = !0, o = I.fragments[s], o && 1 !== o && (r = o)), r || (r = a.createDocumentFragment(), I.clean(e, a, r, n)), i && (I.fragments[s] = o ? r : 1), {
            fragment: r,
            cacheable: i
        }
    }, I.fragments = {}, I.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function(e, t) {
        I.fn[e] = function(n) {
            var r = [],
                i = I(n),
                o = 1 === this.length && this[0].parentNode;
            if (o && 11 === o.nodeType && 1 === o.childNodes.length && 1 === i.length) return i[t](this[0]), this;
            for (var a = 0, s = i.length; s > a; a++) {
                var c = (a > 0 ? this.clone(!0) : this).get();
                I(i[a])[t](c), r = r.concat(c)
            }
            return this.pushStack(r, e, i.selector)
        }
    }), I.extend({
        clone: function(e, t, n) {
            var r, i, o, a = I.support.html5Clone || I.isXMLDoc(e) || !xt.test("<" + e.nodeName + ">") ? e.cloneNode(!0) : v(e);
            if (!(I.support.noCloneEvent && I.support.noCloneChecked || 1 !== e.nodeType && 11 !== e.nodeType || I.isXMLDoc(e)))
                for (p(e, a), r = h(e), i = h(a), o = 0; r[o]; ++o) i[o] && p(r[o], i[o]);
            if (t && (f(e, a), n))
                for (r = h(e), i = h(a), o = 0; r[o]; ++o) f(r[o], i[o]);
            return r = i = null, a
        },
        clean: function(e, t, n, r) {
            var i, o, a, s = [];
            t = t || q, "undefined" == typeof t.createElement && (t = t.ownerDocument || t[0] && t[0].ownerDocument || q);
            for (var c, l = 0; null != (c = e[l]); l++)
                if ("number" == typeof c && (c += ""), c) {
                    if ("string" == typeof c)
                        if ($t.test(c)) {
                            c = c.replace(vt, "<$1></$2>");
                            var d, f = (yt.exec(c) || ["", ""])[1].toLowerCase(),
                                p = At[f] || At._default,
                                h = p[0],
                                g = t.createElement("div"),
                                v = Et.childNodes;
                            for (t === q ? Et.appendChild(g) : u(t).appendChild(g), g.innerHTML = p[1] + c + p[2]; h--;) g = g.lastChild;
                            if (!I.support.tbody) {
                                var y = bt.test(c),
                                    b = "table" !== f || y ? "<table>" !== p[1] || y ? [] : g.childNodes : g.firstChild && g.firstChild.childNodes;
                                for (a = b.length - 1; a >= 0; --a) I.nodeName(b[a], "tbody") && !b[a].childNodes.length && b[a].parentNode.removeChild(b[a])
                            }!I.support.leadingWhitespace && mt.test(c) && g.insertBefore(t.createTextNode(mt.exec(c)[0]), g.firstChild), c = g.childNodes, g && (g.parentNode.removeChild(g), v.length > 0 && (d = v[v.length - 1], d && d.parentNode && d.parentNode.removeChild(d)))
                        } else c = t.createTextNode(c);
                    var $;
                    if (!I.support.appendChecked)
                        if (c[0] && "number" == typeof($ = c.length))
                            for (a = 0; $ > a; a++) m(c[a]);
                        else m(c);
                    c.nodeType ? s.push(c) : s = I.merge(s, c)
                }
            if (n)
                for (i = function(e) {
                    return !e.type || Ct.test(e.type)
                }, l = 0; s[l]; l++)
                    if (o = s[l], r && I.nodeName(o, "script") && (!o.type || Ct.test(o.type))) r.push(o.parentNode ? o.parentNode.removeChild(o) : o);
                    else {
                        if (1 === o.nodeType) {
                            var w = I.grep(o.getElementsByTagName("script"), i);
                            s.splice.apply(s, [l + 1, 0].concat(w))
                        }
                        n.appendChild(o)
                    }
            return s
        },
        cleanData: function(e) {
            for (var t, n, r, i = I.cache, o = I.event.special, a = I.support.deleteExpando, s = 0; null != (r = e[s]); s++)
                if ((!r.nodeName || !I.noData[r.nodeName.toLowerCase()]) && (n = r[I.expando])) {
                    if (t = i[n], t && t.events) {
                        for (var c in t.events) o[c] ? I.event.remove(r, c) : I.removeEvent(r, c, t.handle);
                        t.handle && (t.handle.elem = null)
                    }
                    a ? delete r[I.expando] : r.removeAttribute && r.removeAttribute(I.expando), delete i[n]
                }
        }
    });
    var Nt, jt, _t, qt = /alpha\([^)]*\)/i,
        Mt = /opacity=([^)]*)/,
        Ot = /([A-Z]|^ms)/g,
        It = /^[\-+]?(?:\d*\.)?\d+$/i,
        Dt = /^-?(?:\d*\.)?\d+(?!px)[^\d\s]+$/i,
        Lt = /^([\-+])=([\-+.\de]+)/,
        Pt = /^margin/,
        Ft = {
            position: "absolute",
            visibility: "hidden",
            display: "block"
        }, Rt = ["Top", "Right", "Bottom", "Left"];
    I.fn.css = function(e, n) {
        return I.access(this, function(e, n, r) {
            return r !== t ? I.style(e, n, r) : I.css(e, n)
        }, e, n, arguments.length > 1)
    }, I.extend({
        cssHooks: {
            opacity: {
                get: function(e, t) {
                    if (t) {
                        var n = Nt(e, "opacity");
                        return "" === n ? "1" : n
                    }
                    return e.style.opacity
                }
            }
        },
        cssNumber: {
            fillOpacity: !0,
            fontWeight: !0,
            lineHeight: !0,
            opacity: !0,
            orphans: !0,
            widows: !0,
            zIndex: !0,
            zoom: !0
        },
        cssProps: {
            "float": I.support.cssFloat ? "cssFloat" : "styleFloat"
        },
        style: function(e, n, r, i) {
            if (e && 3 !== e.nodeType && 8 !== e.nodeType && e.style) {
                var o, a, s = I.camelCase(n),
                    c = e.style,
                    l = I.cssHooks[s];
                if (n = I.cssProps[s] || s, r === t) return l && "get" in l && (o = l.get(e, !1, i)) !== t ? o : c[n];
                if (a = typeof r, "string" === a && (o = Lt.exec(r)) && (r = +(o[1] + 1) * +o[2] + parseFloat(I.css(e, n)), a = "number"), !(null == r || "number" === a && isNaN(r) || ("number" !== a || I.cssNumber[s] || (r += "px"), l && "set" in l && (r = l.set(e, r)) === t))) try {
                    c[n] = r
                } catch (u) {}
            }
        },
        css: function(e, n, r) {
            var i, o;
            return n = I.camelCase(n), o = I.cssHooks[n], n = I.cssProps[n] || n, "cssFloat" === n && (n = "float"), o && "get" in o && (i = o.get(e, !0, r)) !== t ? i : Nt ? Nt(e, n) : void 0
        },
        swap: function(e, t, n) {
            var r, i, o = {};
            for (i in t) o[i] = e.style[i], e.style[i] = t[i];
            r = n.call(e);
            for (i in t) e.style[i] = o[i];
            return r
        }
    }), I.curCSS = I.css, q.defaultView && q.defaultView.getComputedStyle && (jt = function(e, t) {
        var n, r, i, o, a = e.style;
        return t = t.replace(Ot, "-$1").toLowerCase(), (r = e.ownerDocument.defaultView) && (i = r.getComputedStyle(e, null)) && (n = i.getPropertyValue(t), "" !== n || I.contains(e.ownerDocument.documentElement, e) || (n = I.style(e, t))), !I.support.pixelMargin && i && Pt.test(t) && Dt.test(n) && (o = a.width, a.width = n, n = i.width, a.width = o), n
    }), q.documentElement.currentStyle && (_t = function(e, t) {
        var n, r, i, o = e.currentStyle && e.currentStyle[t],
            a = e.style;
        return null == o && a && (i = a[t]) && (o = i), Dt.test(o) && (n = a.left, r = e.runtimeStyle && e.runtimeStyle.left, r && (e.runtimeStyle.left = e.currentStyle.left), a.left = "fontSize" === t ? "1em" : o, o = a.pixelLeft + "px", a.left = n, r && (e.runtimeStyle.left = r)), "" === o ? "auto" : o
    }), Nt = jt || _t, I.each(["height", "width"], function(e, t) {
        I.cssHooks[t] = {
            get: function(e, n, r) {
                return n ? 0 !== e.offsetWidth ? y(e, t, r) : I.swap(e, Ft, function() {
                    return y(e, t, r)
                }) : void 0
            },
            set: function(e, t) {
                return It.test(t) ? t + "px" : t
            }
        }
    }), I.support.opacity || (I.cssHooks.opacity = {
        get: function(e, t) {
            return Mt.test((t && e.currentStyle ? e.currentStyle.filter : e.style.filter) || "") ? parseFloat(RegExp.$1) / 100 + "" : t ? "1" : ""
        },
        set: function(e, t) {
            var n = e.style,
                r = e.currentStyle,
                i = I.isNumeric(t) ? "alpha(opacity=" + 100 * t + ")" : "",
                o = r && r.filter || n.filter || "";
            n.zoom = 1, t >= 1 && "" === I.trim(o.replace(qt, "")) && (n.removeAttribute("filter"), r && !r.filter) || (n.filter = qt.test(o) ? o.replace(qt, i) : o + " " + i)
        }
    }), I(function() {
        I.support.reliableMarginRight || (I.cssHooks.marginRight = {
            get: function(e, t) {
                return I.swap(e, {
                    display: "inline-block"
                }, function() {
                    return t ? Nt(e, "margin-right") : e.style.marginRight
                })
            }
        })
    }), I.expr && I.expr.filters && (I.expr.filters.hidden = function(e) {
        var t = e.offsetWidth,
            n = e.offsetHeight;
        return 0 === t && 0 === n || !I.support.reliableHiddenOffsets && "none" === (e.style && e.style.display || I.css(e, "display"))
    }, I.expr.filters.visible = function(e) {
        return !I.expr.filters.hidden(e)
    }), I.each({
        margin: "",
        padding: "",
        border: "Width"
    }, function(e, t) {
        I.cssHooks[e + t] = {
            expand: function(n) {
                var r, i = "string" == typeof n ? n.split(" ") : [n],
                    o = {};
                for (r = 0; 4 > r; r++) o[e + Rt[r] + t] = i[r] || i[r - 2] || i[0];
                return o
            }
        }
    });
    var zt, Ht, Bt = /%20/g,
        Ut = /\[\]$/,
        Wt = /\r?\n/g,
        Vt = /#.*$/,
        Jt = /^(.*?):[ \t]*([^\r\n]*)\r?$/gm,
        Xt = /^(?:color|date|datetime|datetime-local|email|hidden|month|number|password|range|search|tel|text|time|url|week)$/i,
        Gt = /^(?:about|app|app\-storage|.+\-extension|file|res|widget):$/,
        Kt = /^(?:GET|HEAD)$/,
        Qt = /^\/\//,
        Yt = /\?/,
        Zt = /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
        en = /^(?:select|textarea)/i,
        tn = /\s+/,
        nn = /([?&])_=[^&]*/,
        rn = /^([\w\+\.\-]+:)(?:\/\/([^\/?#:]*)(?::(\d+))?)?/,
        on = I.fn.load,
        an = {}, sn = {}, cn = ["*/"] + ["*"];
    try {
        zt = O.href
    } catch (ln) {
        zt = q.createElement("a"), zt.href = "", zt = zt.href
    }
    Ht = rn.exec(zt.toLowerCase()) || [], I.fn.extend({
        load: function(e, n, r) {
            if ("string" != typeof e && on) return on.apply(this, arguments);
            if (!this.length) return this;
            var i = e.indexOf(" ");
            if (i >= 0) {
                var o = e.slice(i, e.length);
                e = e.slice(0, i)
            }
            var a = "GET";
            n && (I.isFunction(n) ? (r = n, n = t) : "object" == typeof n && (n = I.param(n, I.ajaxSettings.traditional), a = "POST"));
            var s = this;
            return I.ajax({
                url: e,
                type: a,
                dataType: "html",
                data: n,
                complete: function(e, t, n) {
                    n = e.responseText, e.isResolved() && (e.done(function(e) {
                        n = e
                    }), s.html(o ? I("<div>").append(n.replace(Zt, "")).find(o) : n)), r && s.each(r, [n, t, e])
                }
            }), this
        },
        serialize: function() {
            return I.param(this.serializeArray())
        },
        serializeArray: function() {
            return this.map(function() {
                return this.elements ? I.makeArray(this.elements) : this
            }).filter(function() {
                return this.name && !this.disabled && (this.checked || en.test(this.nodeName) || Xt.test(this.type))
            }).map(function(e, t) {
                var n = I(this).val();
                return null == n ? null : I.isArray(n) ? I.map(n, function(e) {
                    return {
                        name: t.name,
                        value: e.replace(Wt, "\r\n")
                    }
                }) : {
                    name: t.name,
                    value: n.replace(Wt, "\r\n")
                }
            }).get()
        }
    }), I.each("ajaxStart ajaxStop ajaxComplete ajaxError ajaxSuccess ajaxSend".split(" "), function(e, t) {
        I.fn[t] = function(e) {
            return this.on(t, e)
        }
    }), I.each(["get", "post"], function(e, n) {
        I[n] = function(e, r, i, o) {
            return I.isFunction(r) && (o = o || i, i = r, r = t), I.ajax({
                type: n,
                url: e,
                data: r,
                success: i,
                dataType: o
            })
        }
    }), I.extend({
        getScript: function(e, n) {
            return I.get(e, t, n, "script")
        },
        getJSON: function(e, t, n) {
            return I.get(e, t, n, "json")
        },
        ajaxSetup: function(e, t) {
            return t ? w(e, I.ajaxSettings) : (t = e, e = I.ajaxSettings), w(e, t), e
        },
        ajaxSettings: {
            url: zt,
            isLocal: Gt.test(Ht[1]),
            global: !0,
            type: "GET",
            contentType: "application/x-www-form-urlencoded; charset=UTF-8",
            processData: !0,
            async: !0,
            accepts: {
                xml: "application/xml, text/xml",
                html: "text/html",
                text: "text/plain",
                json: "application/json, text/javascript",
                "*": cn
            },
            contents: {
                xml: /xml/,
                html: /html/,
                json: /json/
            },
            responseFields: {
                xml: "responseXML",
                text: "responseText"
            },
            converters: {
                "* text": e.String,
                "text html": !0,
                "text json": I.parseJSON,
                "text xml": I.parseXML
            },
            flatOptions: {
                context: !0,
                url: !0
            }
        },
        ajaxPrefilter: b(an),
        ajaxTransport: b(sn),
        ajax: function(e, n) {
            function r(e, n, r, a) {
                if (2 !== w) {
                    w = 2, c && clearTimeout(c), s = t, o = a || "", k.readyState = e > 0 ? 4 : 0;
                    var l, d, y, b, $, C = n,
                        S = r ? x(f, k, r) : t;
                    if (e >= 200 && 300 > e || 304 === e)
                        if (f.ifModified && ((b = k.getResponseHeader("Last-Modified")) && (I.lastModified[i] = b), ($ = k.getResponseHeader("Etag")) && (I.etag[i] = $)), 304 === e) C = "notmodified", l = !0;
                        else try {
                            d = T(f, S), C = "success", l = !0
                        } catch (A) {
                            C = "parsererror", y = A
                        } else y = C, (!C || e) && (C = "error", 0 > e && (e = 0));
                    k.status = e, k.statusText = "" + (n || C), l ? g.resolveWith(p, [d, C, k]) : g.rejectWith(p, [k, C, y]), k.statusCode(v), v = t, u && h.trigger("ajax" + (l ? "Success" : "Error"), [k, f, l ? d : y]), m.fireWith(p, [k, C]), u && (h.trigger("ajaxComplete", [k, f]), --I.active || I.event.trigger("ajaxStop"))
                }
            }
            "object" == typeof e && (n = e, e = t), n = n || {};
            var i, o, a, s, c, l, u, d, f = I.ajaxSetup({}, n),
                p = f.context || f,
                h = p !== f && (p.nodeType || p instanceof I) ? I(p) : I.event,
                g = I.Deferred(),
                m = I.Callbacks("once memory"),
                v = f.statusCode || {}, y = {}, b = {}, w = 0,
                k = {
                    readyState: 0,
                    setRequestHeader: function(e, t) {
                        if (!w) {
                            var n = e.toLowerCase();
                            e = b[n] = b[n] || e, y[e] = t
                        }
                        return this
                    },
                    getAllResponseHeaders: function() {
                        return 2 === w ? o : null
                    },
                    getResponseHeader: function(e) {
                        var n;
                        if (2 === w) {
                            if (!a)
                                for (a = {}; n = Jt.exec(o);) a[n[1].toLowerCase()] = n[2];
                            n = a[e.toLowerCase()]
                        }
                        return n === t ? null : n
                    },
                    overrideMimeType: function(e) {
                        return w || (f.mimeType = e), this
                    },
                    abort: function(e) {
                        return e = e || "abort", s && s.abort(e), r(0, e), this
                    }
                };
            if (g.promise(k), k.success = k.done, k.error = k.fail, k.complete = m.add, k.statusCode = function(e) {
                if (e) {
                    var t;
                    if (2 > w)
                        for (t in e) v[t] = [v[t], e[t]];
                    else t = e[k.status], k.then(t, t)
                }
                return this
            }, f.url = ((e || f.url) + "").replace(Vt, "").replace(Qt, Ht[1] + "//"), f.dataTypes = I.trim(f.dataType || "*").toLowerCase().split(tn), null == f.crossDomain && (l = rn.exec(f.url.toLowerCase()), f.crossDomain = !(!l || l[1] == Ht[1] && l[2] == Ht[2] && (l[3] || ("http:" === l[1] ? 80 : 443)) == (Ht[3] || ("http:" === Ht[1] ? 80 : 443)))), f.data && f.processData && "string" != typeof f.data && (f.data = I.param(f.data, f.traditional)), $(an, f, n, k), 2 === w) return !1;
            if (u = f.global, f.type = f.type.toUpperCase(), f.hasContent = !Kt.test(f.type), u && 0 === I.active++ && I.event.trigger("ajaxStart"), !f.hasContent && (f.data && (f.url += (Yt.test(f.url) ? "&" : "?") + f.data, delete f.data), i = f.url, f.cache === !1)) {
                var C = I.now(),
                    S = f.url.replace(nn, "$1_=" + C);
                f.url = S + (S === f.url ? (Yt.test(f.url) ? "&" : "?") + "_=" + C : "")
            }(f.data && f.hasContent && f.contentType !== !1 || n.contentType) && k.setRequestHeader("Content-Type", f.contentType), f.ifModified && (i = i || f.url, I.lastModified[i] && k.setRequestHeader("If-Modified-Since", I.lastModified[i]), I.etag[i] && k.setRequestHeader("If-None-Match", I.etag[i])), k.setRequestHeader("Accept", f.dataTypes[0] && f.accepts[f.dataTypes[0]] ? f.accepts[f.dataTypes[0]] + ("*" !== f.dataTypes[0] ? ", " + cn + "; q=0.01" : "") : f.accepts["*"]);
            for (d in f.headers) k.setRequestHeader(d, f.headers[d]);
            if (f.beforeSend && (f.beforeSend.call(p, k, f) === !1 || 2 === w)) return k.abort(), !1;
            for (d in {
                success: 1,
                error: 1,
                complete: 1
            }) k[d](f[d]);
            if (s = $(sn, f, n, k)) {
                k.readyState = 1, u && h.trigger("ajaxSend", [k, f]), f.async && f.timeout > 0 && (c = setTimeout(function() {
                    k.abort("timeout")
                }, f.timeout));
                try {
                    w = 1, s.send(y, r)
                } catch (A) {
                    if (!(2 > w)) throw A;
                    r(-1, A)
                }
            } else r(-1, "No Transport");
            return k
        },
        param: function(e, n) {
            var r = [],
                i = function(e, t) {
                    t = I.isFunction(t) ? t() : t, r[r.length] = encodeURIComponent(e) + "=" + encodeURIComponent(t)
                };
            if (n === t && (n = I.ajaxSettings.traditional), I.isArray(e) || e.jquery && !I.isPlainObject(e)) I.each(e, function() {
                i(this.name, this.value)
            });
            else
                for (var o in e) k(o, e[o], n, i);
            return r.join("&").replace(Bt, "+")
        }
    }), I.extend({
        active: 0,
        lastModified: {},
        etag: {}
    });
    var un = I.now(),
        dn = /(\=)\?(&|$)|\?\?/i;
    I.ajaxSetup({
        jsonp: "callback",
        jsonpCallback: function() {
            return I.expando + "_" + un++
        }
    }), I.ajaxPrefilter("json jsonp", function(t, n, r) {
        var i = "string" == typeof t.data && /^application\/x\-www\-form\-urlencoded/.test(t.contentType);
        if ("jsonp" === t.dataTypes[0] || t.jsonp !== !1 && (dn.test(t.url) || i && dn.test(t.data))) {
            var o, a = t.jsonpCallback = I.isFunction(t.jsonpCallback) ? t.jsonpCallback() : t.jsonpCallback,
                s = e[a],
                c = t.url,
                l = t.data,
                u = "$1" + a + "$2";
            return t.jsonp !== !1 && (c = c.replace(dn, u), t.url === c && (i && (l = l.replace(dn, u)), t.data === l && (c += (/\?/.test(c) ? "&" : "?") + t.jsonp + "=" + a))), t.url = c, t.data = l, e[a] = function(e) {
                o = [e]
            }, r.always(function() {
                e[a] = s, o && I.isFunction(s) && e[a](o[0])
            }), t.converters["script json"] = function() {
                return o || I.error(a + " was not called"), o[0]
            }, t.dataTypes[0] = "json", "script"
        }
    }), I.ajaxSetup({
        accepts: {
            script: "text/javascript, application/javascript, application/ecmascript, application/x-ecmascript"
        },
        contents: {
            script: /javascript|ecmascript/
        },
        converters: {
            "text script": function(e) {
                return I.globalEval(e), e
            }
        }
    }), I.ajaxPrefilter("script", function(e) {
        e.cache === t && (e.cache = !1), e.crossDomain && (e.type = "GET", e.global = !1)
    }), I.ajaxTransport("script", function(e) {
        if (e.crossDomain) {
            var n, r = q.head || q.getElementsByTagName("head")[0] || q.documentElement;
            return {
                send: function(i, o) {
                    n = q.createElement("script"), n.async = "async", e.scriptCharset && (n.charset = e.scriptCharset), n.src = e.url, n.onload = n.onreadystatechange = function(e, i) {
                        (i || !n.readyState || /loaded|complete/.test(n.readyState)) && (n.onload = n.onreadystatechange = null, r && n.parentNode && r.removeChild(n), n = t, i || o(200, "success"))
                    }, r.insertBefore(n, r.firstChild)
                },
                abort: function() {
                    n && n.onload(0, 1)
                }
            }
        }
    });
    var fn, pn = e.ActiveXObject ? function() {
            for (var e in fn) fn[e](0, 1)
        } : !1,
        hn = 0;
    I.ajaxSettings.xhr = e.ActiveXObject ? function() {
        return !this.isLocal && C() || S()
    } : C,
        function(e) {
            I.extend(I.support, {
                ajax: !! e,
                cors: !! e && "withCredentials" in e
            })
        }(I.ajaxSettings.xhr()), I.support.ajax && I.ajaxTransport(function(n) {
        if (!n.crossDomain || I.support.cors) {
            var r;
            return {
                send: function(i, o) {
                    var a, s, c = n.xhr();
                    if (n.username ? c.open(n.type, n.url, n.async, n.username, n.password) : c.open(n.type, n.url, n.async), n.xhrFields)
                        for (s in n.xhrFields) c[s] = n.xhrFields[s];
                    n.mimeType && c.overrideMimeType && c.overrideMimeType(n.mimeType), n.crossDomain || i["X-Requested-With"] || (i["X-Requested-With"] = "XMLHttpRequest");
                    try {
                        for (s in i) c.setRequestHeader(s, i[s])
                    } catch (l) {}
                    c.send(n.hasContent && n.data || null), r = function(e, i) {
                        var s, l, u, d, f;
                        try {
                            if (r && (i || 4 === c.readyState))
                                if (r = t, a && (c.onreadystatechange = I.noop, pn && delete fn[a]), i) 4 !== c.readyState && c.abort();
                                else {
                                    s = c.status, u = c.getAllResponseHeaders(), d = {}, f = c.responseXML, f && f.documentElement && (d.xml = f);
                                    try {
                                        d.text = c.responseText
                                    } catch (e) {}
                                    try {
                                        l = c.statusText
                                    } catch (p) {
                                        l = ""
                                    }
                                    s || !n.isLocal || n.crossDomain ? 1223 === s && (s = 204) : s = d.text ? 200 : 404
                                }
                        } catch (h) {
                            i || o(-1, h)
                        }
                        d && o(s, l, d, u)
                    }, n.async && 4 !== c.readyState ? (a = ++hn, pn && (fn || (fn = {}, I(e).unload(pn)), fn[a] = r), c.onreadystatechange = r) : r()
                },
                abort: function() {
                    r && r(0, 1)
                }
            }
        }
    });
    var gn, mn, vn, yn, bn = {}, $n = /^(?:toggle|show|hide)$/,
        wn = /^([+\-]=)?([\d+.\-]+)([a-z%]*)$/i,
        kn = [
            ["height", "marginTop", "marginBottom", "paddingTop", "paddingBottom"],
            ["width", "marginLeft", "marginRight", "paddingLeft", "paddingRight"],
            ["opacity"]
        ];
    I.fn.extend({
        show: function(e, t, n) {
            var r, i;
            if (e || 0 === e) return this.animate(N("show", 3), e, t, n);
            for (var o = 0, a = this.length; a > o; o++) r = this[o], r.style && (i = r.style.display, I._data(r, "olddisplay") || "none" !== i || (i = r.style.display = ""), ("" === i && "none" === I.css(r, "display") || !I.contains(r.ownerDocument.documentElement, r)) && I._data(r, "olddisplay", j(r.nodeName)));
            for (o = 0; a > o; o++) r = this[o], r.style && (i = r.style.display, ("" === i || "none" === i) && (r.style.display = I._data(r, "olddisplay") || ""));
            return this
        },
        hide: function(e, t, n) {
            if (e || 0 === e) return this.animate(N("hide", 3), e, t, n);
            for (var r, i, o = 0, a = this.length; a > o; o++) r = this[o], r.style && (i = I.css(r, "display"), "none" === i || I._data(r, "olddisplay") || I._data(r, "olddisplay", i));
            for (o = 0; a > o; o++) this[o].style && (this[o].style.display = "none");
            return this
        },
        _toggle: I.fn.toggle,
        toggle: function(e, t, n) {
            var r = "boolean" == typeof e;
            return I.isFunction(e) && I.isFunction(t) ? this._toggle.apply(this, arguments) : null == e || r ? this.each(function() {
                var t = r ? e : I(this).is(":hidden");
                I(this)[t ? "show" : "hide"]()
            }) : this.animate(N("toggle", 3), e, t, n), this
        },
        fadeTo: function(e, t, n, r) {
            return this.filter(":hidden").css("opacity", 0).show().end().animate({
                opacity: t
            }, e, n, r)
        },
        animate: function(e, t, n, r) {
            function i() {
                o.queue === !1 && I._mark(this);
                var t, n, r, i, a, s, c, l, u, d, f, p = I.extend({}, o),
                    h = 1 === this.nodeType,
                    g = h && I(this).is(":hidden");
                p.animatedProperties = {};
                for (r in e)
                    if (t = I.camelCase(r), r !== t && (e[t] = e[r], delete e[r]), (a = I.cssHooks[t]) && "expand" in a) {
                        s = a.expand(e[t]), delete e[t];
                        for (r in s) r in e || (e[r] = s[r])
                    }
                for (t in e) {
                    if (n = e[t], I.isArray(n) ? (p.animatedProperties[t] = n[1], n = e[t] = n[0]) : p.animatedProperties[t] = p.specialEasing && p.specialEasing[t] || p.easing || "swing", "hide" === n && g || "show" === n && !g) return p.complete.call(this);
                    !h || "height" !== t && "width" !== t || (p.overflow = [this.style.overflow, this.style.overflowX, this.style.overflowY], "inline" === I.css(this, "display") && "none" === I.css(this, "float") && (I.support.inlineBlockNeedsLayout && "inline" !== j(this.nodeName) ? this.style.zoom = 1 : this.style.display = "inline-block"))
                }
                null != p.overflow && (this.style.overflow = "hidden");
                for (r in e) i = new I.fx(this, p, r), n = e[r], $n.test(n) ? (f = I._data(this, "toggle" + r) || ("toggle" === n ? g ? "show" : "hide" : 0), f ? (I._data(this, "toggle" + r, "show" === f ? "hide" : "show"), i[f]()) : i[n]()) : (c = wn.exec(n), l = i.cur(), c ? (u = parseFloat(c[2]), d = c[3] || (I.cssNumber[r] ? "" : "px"), "px" !== d && (I.style(this, r, (u || 1) + d), l = (u || 1) / i.cur() * l, I.style(this, r, l + d)), c[1] && (u = ("-=" === c[1] ? -1 : 1) * u + l), i.custom(l, u, d)) : i.custom(l, n, ""));
                return !0
            }
            var o = I.speed(t, n, r);
            return I.isEmptyObject(e) ? this.each(o.complete, [!1]) : (e = I.extend({}, e), o.queue === !1 ? this.each(i) : this.queue(o.queue, i))
        },
        stop: function(e, n, r) {
            return "string" != typeof e && (r = n, n = e, e = t), n && e !== !1 && this.queue(e || "fx", []), this.each(function() {
                function t(e, t, n) {
                    var i = t[n];
                    I.removeData(e, n, !0), i.stop(r)
                }
                var n, i = !1,
                    o = I.timers,
                    a = I._data(this);
                if (r || I._unmark(!0, this), null == e)
                    for (n in a) a[n] && a[n].stop && n.indexOf(".run") === n.length - 4 && t(this, a, n);
                else a[n = e + ".run"] && a[n].stop && t(this, a, n);
                for (n = o.length; n--;) o[n].elem !== this || null != e && o[n].queue !== e || (r ? o[n](!0) : o[n].saveState(), i = !0, o.splice(n, 1));
                r && i || I.dequeue(this, e)
            })
        }
    }), I.each({
        slideDown: N("show", 1),
        slideUp: N("hide", 1),
        slideToggle: N("toggle", 1),
        fadeIn: {
            opacity: "show"
        },
        fadeOut: {
            opacity: "hide"
        },
        fadeToggle: {
            opacity: "toggle"
        }
    }, function(e, t) {
        I.fn[e] = function(e, n, r) {
            return this.animate(t, e, n, r)
        }
    }), I.extend({
        speed: function(e, t, n) {
            var r = e && "object" == typeof e ? I.extend({}, e) : {
                complete: n || !n && t || I.isFunction(e) && e,
                duration: e,
                easing: n && t || t && !I.isFunction(t) && t
            };
            return r.duration = I.fx.off ? 0 : "number" == typeof r.duration ? r.duration : r.duration in I.fx.speeds ? I.fx.speeds[r.duration] : I.fx.speeds._default, (null == r.queue || r.queue === !0) && (r.queue = "fx"), r.old = r.complete, r.complete = function(e) {
                I.isFunction(r.old) && r.old.call(this), r.queue ? I.dequeue(this, r.queue) : e !== !1 && I._unmark(this)
            }, r
        },
        easing: {
            linear: function(e) {
                return e
            },
            swing: function(e) {
                return -Math.cos(e * Math.PI) / 2 + .5
            }
        },
        timers: [],
        fx: function(e, t, n) {
            this.options = t, this.elem = e, this.prop = n, t.orig = t.orig || {}
        }
    }), I.fx.prototype = {
        update: function() {
            this.options.step && this.options.step.call(this.elem, this.now, this), (I.fx.step[this.prop] || I.fx.step._default)(this)
        },
        cur: function() {
            if (null != this.elem[this.prop] && (!this.elem.style || null == this.elem.style[this.prop])) return this.elem[this.prop];
            var e, t = I.css(this.elem, this.prop);
            return isNaN(e = parseFloat(t)) ? t && "auto" !== t ? t : 0 : e
        },
        custom: function(e, n, r) {
            function i(e) {
                return o.step(e)
            }
            var o = this,
                a = I.fx;
            this.startTime = yn || A(), this.end = n, this.now = this.start = e, this.pos = this.state = 0, this.unit = r || this.unit || (I.cssNumber[this.prop] ? "" : "px"), i.queue = this.options.queue, i.elem = this.elem, i.saveState = function() {
                I._data(o.elem, "fxshow" + o.prop) === t && (o.options.hide ? I._data(o.elem, "fxshow" + o.prop, o.start) : o.options.show && I._data(o.elem, "fxshow" + o.prop, o.end))
            }, i() && I.timers.push(i) && !vn && (vn = setInterval(a.tick, a.interval))
        },
        show: function() {
            var e = I._data(this.elem, "fxshow" + this.prop);
            this.options.orig[this.prop] = e || I.style(this.elem, this.prop), this.options.show = !0, e !== t ? this.custom(this.cur(), e) : this.custom("width" === this.prop || "height" === this.prop ? 1 : 0, this.cur()), I(this.elem).show()
        },
        hide: function() {
            this.options.orig[this.prop] = I._data(this.elem, "fxshow" + this.prop) || I.style(this.elem, this.prop), this.options.hide = !0, this.custom(this.cur(), 0)
        },
        step: function(e) {
            var t, n, r, i = yn || A(),
                o = !0,
                a = this.elem,
                s = this.options;
            if (e || i >= s.duration + this.startTime) {
                this.now = this.end, this.pos = this.state = 1, this.update(), s.animatedProperties[this.prop] = !0;
                for (t in s.animatedProperties) s.animatedProperties[t] !== !0 && (o = !1);
                if (o) {
                    if (null == s.overflow || I.support.shrinkWrapBlocks || I.each(["", "X", "Y"], function(e, t) {
                        a.style["overflow" + t] = s.overflow[e]
                    }), s.hide && I(a).hide(), s.hide || s.show)
                        for (t in s.animatedProperties) I.style(a, t, s.orig[t]), I.removeData(a, "fxshow" + t, !0), I.removeData(a, "toggle" + t, !0);
                    r = s.complete, r && (s.complete = !1, r.call(a))
                }
                return !1
            }
            return 1 / 0 == s.duration ? this.now = i : (n = i - this.startTime, this.state = n / s.duration, this.pos = I.easing[s.animatedProperties[this.prop]](this.state, n, 0, 1, s.duration), this.now = this.start + (this.end - this.start) * this.pos), this.update(), !0
        }
    }, I.extend(I.fx, {
        tick: function() {
            for (var e, t = I.timers, n = 0; n < t.length; n++) e = t[n], e() || t[n] !== e || t.splice(n--, 1);
            t.length || I.fx.stop()
        },
        interval: 13,
        stop: function() {
            clearInterval(vn), vn = null
        },
        speeds: {
            slow: 600,
            fast: 200,
            _default: 400
        },
        step: {
            opacity: function(e) {
                I.style(e.elem, "opacity", e.now)
            },
            _default: function(e) {
                e.elem.style && null != e.elem.style[e.prop] ? e.elem.style[e.prop] = e.now + e.unit : e.elem[e.prop] = e.now
            }
        }
    }), I.each(kn.concat.apply([], kn), function(e, t) {
        t.indexOf("margin") && (I.fx.step[t] = function(e) {
            I.style(e.elem, t, Math.max(0, e.now) + e.unit)
        })
    }), I.expr && I.expr.filters && (I.expr.filters.animated = function(e) {
        return I.grep(I.timers, function(t) {
            return e === t.elem
        }).length
    });
    var xn, Tn = /^t(?:able|d|h)$/i,
        Cn = /^(?:body|html)$/i;
    xn = "getBoundingClientRect" in q.documentElement ? function(e, t, n, r) {
        try {
            r = e.getBoundingClientRect()
        } catch (i) {}
        if (!r || !I.contains(n, e)) return r ? {
            top: r.top,
            left: r.left
        } : {
            top: 0,
            left: 0
        };
        var o = t.body,
            a = _(t),
            s = n.clientTop || o.clientTop || 0,
            c = n.clientLeft || o.clientLeft || 0,
            l = a.pageYOffset || I.support.boxModel && n.scrollTop || o.scrollTop,
            u = a.pageXOffset || I.support.boxModel && n.scrollLeft || o.scrollLeft,
            d = r.top + l - s,
            f = r.left + u - c;
        return {
            top: d,
            left: f
        }
    } : function(e, t, n) {
        for (var r, i = e.offsetParent, o = e, a = t.body, s = t.defaultView, c = s ? s.getComputedStyle(e, null) : e.currentStyle, l = e.offsetTop, u = e.offsetLeft;
             (e = e.parentNode) && e !== a && e !== n && (!I.support.fixedPosition || "fixed" !== c.position);) r = s ? s.getComputedStyle(e, null) : e.currentStyle, l -= e.scrollTop, u -= e.scrollLeft, e === i && (l += e.offsetTop, u += e.offsetLeft, !I.support.doesNotAddBorder || I.support.doesAddBorderForTableAndCells && Tn.test(e.nodeName) || (l += parseFloat(r.borderTopWidth) || 0, u += parseFloat(r.borderLeftWidth) || 0), o = i, i = e.offsetParent), I.support.subtractsBorderForOverflowNotVisible && "visible" !== r.overflow && (l += parseFloat(r.borderTopWidth) || 0, u += parseFloat(r.borderLeftWidth) || 0), c = r;
        return ("relative" === c.position || "static" === c.position) && (l += a.offsetTop, u += a.offsetLeft), I.support.fixedPosition && "fixed" === c.position && (l += Math.max(n.scrollTop, a.scrollTop), u += Math.max(n.scrollLeft, a.scrollLeft)), {
            top: l,
            left: u
        }
    }, I.fn.offset = function(e) {
        if (arguments.length) return e === t ? this : this.each(function(t) {
            I.offset.setOffset(this, e, t)
        });
        var n = this[0],
            r = n && n.ownerDocument;
        return r ? n === r.body ? I.offset.bodyOffset(n) : xn(n, r, r.documentElement) : null
    }, I.offset = {
        bodyOffset: function(e) {
            var t = e.offsetTop,
                n = e.offsetLeft;
            return I.support.doesNotIncludeMarginInBodyOffset && (t += parseFloat(I.css(e, "marginTop")) || 0, n += parseFloat(I.css(e, "marginLeft")) || 0), {
                top: t,
                left: n
            }
        },
        setOffset: function(e, t, n) {
            var r = I.css(e, "position");
            "static" === r && (e.style.position = "relative");
            var i, o, a = I(e),
                s = a.offset(),
                c = I.css(e, "top"),
                l = I.css(e, "left"),
                u = ("absolute" === r || "fixed" === r) && I.inArray("auto", [c, l]) > -1,
                d = {}, f = {};
            u ? (f = a.position(), i = f.top, o = f.left) : (i = parseFloat(c) || 0, o = parseFloat(l) || 0), I.isFunction(t) && (t = t.call(e, n, s)), null != t.top && (d.top = t.top - s.top + i), null != t.left && (d.left = t.left - s.left + o), "using" in t ? t.using.call(e, d) : a.css(d)
        }
    }, I.fn.extend({
        position: function() {
            if (!this[0]) return null;
            var e = this[0],
                t = this.offsetParent(),
                n = this.offset(),
                r = Cn.test(t[0].nodeName) ? {
                    top: 0,
                    left: 0
                } : t.offset();
            return n.top -= parseFloat(I.css(e, "marginTop")) || 0, n.left -= parseFloat(I.css(e, "marginLeft")) || 0, r.top += parseFloat(I.css(t[0], "borderTopWidth")) || 0, r.left += parseFloat(I.css(t[0], "borderLeftWidth")) || 0, {
                top: n.top - r.top,
                left: n.left - r.left
            }
        },
        offsetParent: function() {
            return this.map(function() {
                for (var e = this.offsetParent || q.body; e && !Cn.test(e.nodeName) && "static" === I.css(e, "position");) e = e.offsetParent;
                return e
            })
        }
    }), I.each({
        scrollLeft: "pageXOffset",
        scrollTop: "pageYOffset"
    }, function(e, n) {
        var r = /Y/.test(n);
        I.fn[e] = function(i) {
            return I.access(this, function(e, i, o) {
                var a = _(e);
                return o === t ? a ? n in a ? a[n] : I.support.boxModel && a.document.documentElement[i] || a.document.body[i] : e[i] : void(a ? a.scrollTo(r ? I(a).scrollLeft() : o, r ? o : I(a).scrollTop()) : e[i] = o)
            }, e, i, arguments.length, null)
        }
    }), I.each({
        Height: "height",
        Width: "width"
    }, function(e, n) {
        var r = "client" + e,
            i = "scroll" + e,
            o = "offset" + e;
        I.fn["inner" + e] = function() {
            var e = this[0];
            return e ? e.style ? parseFloat(I.css(e, n, "padding")) : this[n]() : null
        }, I.fn["outer" + e] = function(e) {
            var t = this[0];
            return t ? t.style ? parseFloat(I.css(t, n, e ? "margin" : "border")) : this[n]() : null
        }, I.fn[n] = function(e) {
            return I.access(this, function(e, n, a) {
                var s, c, l, u;
                return I.isWindow(e) ? (s = e.document, c = s.documentElement[r], I.support.boxModel && c || s.body && s.body[r] || c) : 9 === e.nodeType ? (s = e.documentElement, s[r] >= s[i] ? s[r] : Math.max(e.body[i], s[i], e.body[o], s[o])) : a === t ? (l = I.css(e, n), u = parseFloat(l), I.isNumeric(u) ? u : l) : void I(e).css(n, a)
            }, n, e, arguments.length, null)
        }
    }), e.jQuery = e.$ = I, "function" == typeof define && define.amd && define.amd.jQuery && define("jquery", [], function() {
        return I
    })
}(window),
    function(e, t, n) {
        "use strict";

        function r(e) {
            return function() {
                var t, n, r = arguments[0],
                    i = "[" + (e ? e + ":" : "") + r + "] ",
                    o = arguments[1],
                    a = arguments,
                    s = function(e) {
                        return "function" == typeof e ? e.toString().replace(/ \{[\s\S]*$/, "") : "undefined" == typeof e ? "undefined" : "string" != typeof e ? JSON.stringify(e) : e
                    };
                for (t = i + o.replace(/\{\d+\}/g, function(e) {
                    var t, n = +e.slice(1, -1);
                    return n + 2 < a.length ? (t = a[n + 2], "function" == typeof t ? t.toString().replace(/ ?\{[\s\S]*$/, "") : "undefined" == typeof t ? "undefined" : "string" != typeof t ? B(t) : t) : e
                }), t = t + "\nhttp://errors.angularjs.org/1.2.16/" + (e ? e + "/" : "") + r, n = 2; n < arguments.length; n++) t = t + (2 == n ? "?" : "&") + "p" + (n - 2) + "=" + encodeURIComponent(s(arguments[n]));
                return new Error(t)
            }
        }

        function i(e) {
            if (null == e || S(e)) return !1;
            var t = e.length;
            return 1 === e.nodeType && t ? !0 : $(e) || x(e) || 0 === t || "number" == typeof t && t > 0 && t - 1 in e
        }

        function o(e, t, n) {
            var r;
            if (e)
                if (T(e))
                    for (r in e) "prototype" == r || "length" == r || "name" == r || e.hasOwnProperty && !e.hasOwnProperty(r) || t.call(n, e[r], r);
                else if (e.forEach && e.forEach !== o) e.forEach(t, n);
                else if (i(e))
                    for (r = 0; r < e.length; r++) t.call(n, e[r], r);
                else
                    for (r in e) e.hasOwnProperty(r) && t.call(n, e[r], r);
            return e
        }

        function a(e) {
            var t = [];
            for (var n in e) e.hasOwnProperty(n) && t.push(n);
            return t.sort()
        }

        function s(e, t, n) {
            for (var r = a(e), i = 0; i < r.length; i++) t.call(n, e[r[i]], r[i]);
            return r
        }

        function c(e) {
            return function(t, n) {
                e(n, t)
            }
        }

        function l() {
            for (var e, t = Er.length; t;) {
                if (t--, e = Er[t].charCodeAt(0), 57 == e) return Er[t] = "A", Er.join("");
                if (90 != e) return Er[t] = String.fromCharCode(e + 1), Er.join("");
                Er[t] = "0"
            }
            return Er.unshift("0"), Er.join("")
        }

        function u(e, t) {
            t ? e.$$hashKey = t : delete e.$$hashKey
        }

        function d(e) {
            var t = e.$$hashKey;
            return o(arguments, function(t) {
                t !== e && o(t, function(t, n) {
                    e[n] = t
                })
            }), u(e, t), e
        }

        function f(e) {
            return parseInt(e, 10)
        }

        function p(e, t) {
            return d(new(d(function() {}, {
                prototype: e
            })), t)
        }

        function h() {}

        function g(e) {
            return e
        }

        function m(e) {
            return function() {
                return e
            }
        }

        function v(e) {
            return "undefined" == typeof e
        }

        function y(e) {
            return "undefined" != typeof e
        }

        function b(e) {
            return null != e && "object" == typeof e
        }

        function $(e) {
            return "string" == typeof e
        }

        function w(e) {
            return "number" == typeof e
        }

        function k(e) {
            return "[object Date]" === Cr.call(e)
        }

        function x(e) {
            return "[object Array]" === Cr.call(e)
        }

        function T(e) {
            return "function" == typeof e
        }

        function C(e) {
            return "[object RegExp]" === Cr.call(e)
        }

        function S(e) {
            return e && e.document && e.location && e.alert && e.setInterval
        }

        function A(e) {
            return e && e.$evalAsync && e.$watch
        }

        function E(e) {
            return "[object File]" === Cr.call(e)
        }

        function N(e) {
            return "[object Blob]" === Cr.call(e)
        }

        function j(e) {
            return !(!e || !(e.nodeName || e.prop && e.attr && e.find))
        }

        function _(e, t, n) {
            var r = [];
            return o(e, function(e, i, o) {
                r.push(t.call(n, e, i, o))
            }), r
        }

        function q(e, t) {
            return -1 != M(e, t)
        }

        function M(e, t) {
            if (e.indexOf) return e.indexOf(t);
            for (var n = 0; n < e.length; n++)
                if (t === e[n]) return n;
            return -1
        }

        function O(e, t) {
            var n = M(e, t);
            return n >= 0 && e.splice(n, 1), t
        }

        function I(e, t) {
            if (S(e) || A(e)) throw Sr("cpws", "Can't copy! Making copies of Window or Scope instances is not supported.");
            if (t) {
                if (e === t) throw Sr("cpi", "Can't copy! Source and destination are identical.");
                if (x(e)) {
                    t.length = 0;
                    for (var n = 0; n < e.length; n++) t.push(I(e[n]))
                } else {
                    var r = t.$$hashKey;
                    o(t, function(e, n) {
                        delete t[n]
                    });
                    for (var i in e) t[i] = I(e[i]);
                    u(t, r)
                }
            } else t = e, e && (x(e) ? t = I(e, []) : k(e) ? t = new Date(e.getTime()) : C(e) ? t = new RegExp(e.source) : b(e) && (t = I(e, {})));
            return t
        }

        function D(e, t) {
            t = t || {};
            for (var n in e)!e.hasOwnProperty(n) || "$" === n.charAt(0) && "$" === n.charAt(1) || (t[n] = e[n]);
            return t
        }

        function L(e, t) {
            if (e === t) return !0;
            if (null === e || null === t) return !1;
            if (e !== e && t !== t) return !0;
            var r, i, o, a = typeof e,
                s = typeof t;
            if (a == s && "object" == a) {
                if (!x(e)) {
                    if (k(e)) return k(t) && e.getTime() == t.getTime();
                    if (C(e) && C(t)) return e.toString() == t.toString();
                    if (A(e) || A(t) || S(e) || S(t) || x(t)) return !1;
                    o = {};
                    for (i in e)
                        if ("$" !== i.charAt(0) && !T(e[i])) {
                            if (!L(e[i], t[i])) return !1;
                            o[i] = !0
                        }
                    for (i in t)
                        if (!o.hasOwnProperty(i) && "$" !== i.charAt(0) && t[i] !== n && !T(t[i])) return !1;
                    return !0
                }
                if (!x(t)) return !1;
                if ((r = e.length) == t.length) {
                    for (i = 0; r > i; i++)
                        if (!L(e[i], t[i])) return !1;
                    return !0
                }
            }
            return !1
        }

        function P() {
            return t.securityPolicy && t.securityPolicy.isActive || t.querySelector && !(!t.querySelector("[ng-csp]") && !t.querySelector("[data-ng-csp]"))
        }

        function F(e, t, n) {
            return e.concat(xr.call(t, n))
        }

        function R(e, t) {
            return xr.call(e, t || 0)
        }

        function z(e, t) {
            var n = arguments.length > 2 ? R(arguments, 2) : [];
            return !T(t) || t instanceof RegExp ? t : n.length ? function() {
                return arguments.length ? t.apply(e, n.concat(xr.call(arguments, 0))) : t.apply(e, n)
            } : function() {
                return arguments.length ? t.apply(e, arguments) : t.call(e)
            }
        }

        function H(e, r) {
            var i = r;
            return "string" == typeof e && "$" === e.charAt(0) ? i = n : S(r) ? i = "$WINDOW" : r && t === r ? i = "$DOCUMENT" : A(r) && (i = "$SCOPE"), i
        }

        function B(e, t) {
            return "undefined" == typeof e ? n : JSON.stringify(e, H, t ? "  " : null)
        }

        function U(e) {
            return $(e) ? JSON.parse(e) : e
        }

        function W(e) {
            if ("function" == typeof e) e = !0;
            else if (e && 0 !== e.length) {
                var t = pr("" + e);
                e = !("f" == t || "0" == t || "false" == t || "no" == t || "n" == t || "[]" == t)
            } else e = !1;
            return e
        }

        function V(e) {
            e = br(e).clone();
            try {
                e.empty()
            } catch (t) {}
            var n = 3,
                r = br("<div>").append(e).html();
            try {
                return e[0].nodeType === n ? pr(r) : r.match(/^(<[^>]+>)/)[1].replace(/^<([\w\-]+)/, function(e, t) {
                    return "<" + pr(t)
                })
            } catch (t) {
                return pr(r)
            }
        }

        function J(e) {
            try {
                return decodeURIComponent(e)
            } catch (t) {}
        }

        function X(e) {
            var t, n, r = {};
            return o((e || "").split("&"), function(e) {
                if (e && (t = e.split("="), n = J(t[0]), y(n))) {
                    var i = y(t[1]) ? J(t[1]) : !0;
                    r[n] ? x(r[n]) ? r[n].push(i) : r[n] = [r[n], i] : r[n] = i
                }
            }), r
        }

        function G(e) {
            var t = [];
            return o(e, function(e, n) {
                x(e) ? o(e, function(e) {
                    t.push(Q(n, !0) + (e === !0 ? "" : "=" + Q(e, !0)))
                }) : t.push(Q(n, !0) + (e === !0 ? "" : "=" + Q(e, !0)))
            }), t.length ? t.join("&") : ""
        }

        function K(e) {
            return Q(e, !0).replace(/%26/gi, "&").replace(/%3D/gi, "=").replace(/%2B/gi, "+")
        }

        function Q(e, t) {
            return encodeURIComponent(e).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, t ? "%20" : "+")
        }

        function Y(e, n) {
            function r(e) {
                e && s.push(e)
            }
            var i, a, s = [e],
                c = ["ng:app", "ng-app", "x-ng-app", "data-ng-app"],
                l = /\sng[:\-]app(:\s*([\w\d_]+);?)?\s/;
            o(c, function(n) {
                c[n] = !0, r(t.getElementById(n)), n = n.replace(":", "\\:"), e.querySelectorAll && (o(e.querySelectorAll("." + n), r), o(e.querySelectorAll("." + n + "\\:"), r), o(e.querySelectorAll("[" + n + "]"), r))
            }), o(s, function(e) {
                if (!i) {
                    var t = " " + e.className + " ",
                        n = l.exec(t);
                    n ? (i = e, a = (n[2] || "").replace(/\s+/g, ",")) : o(e.attributes, function(t) {
                        !i && c[t.name] && (i = e, a = t.value)
                    })
                }
            }), i && n(i, a ? [a] : [])
        }

        function Z(n, r) {
            var i = function() {
                if (n = br(n), n.injector()) {
                    var e = n[0] === t ? "document" : V(n);
                    throw Sr("btstrpd", "App Already Bootstrapped with this Element '{0}'", e)
                }
                r = r || [], r.unshift(["$provide",
                    function(e) {
                        e.value("$rootElement", n)
                    }
                ]), r.unshift("ng");
                var i = Ot(r);
                return i.invoke(["$rootScope", "$rootElement", "$compile", "$injector", "$animate",
                    function(e, t, n, r) {
                        e.$apply(function() {
                            t.data("$injector", r), n(t)(e)
                        })
                    }
                ]), i
            }, a = /^NG_DEFER_BOOTSTRAP!/;
            return e && !a.test(e.name) ? i() : (e.name = e.name.replace(a, ""), void(Ar.resumeBootstrap = function(e) {
                o(e, function(e) {
                    r.push(e)
                }), i()
            }))
        }

        function et(e, t) {
            return t = t || "_", e.replace(jr, function(e, n) {
                return (n ? t : "") + e.toLowerCase()
            })
        }

        function tt() {
            $r = e.jQuery, $r ? (br = $r, d($r.fn, {
                scope: Wr.scope,
                isolateScope: Wr.isolateScope,
                controller: Wr.controller,
                injector: Wr.injector,
                inheritedData: Wr.inheritedData
            }), dt("remove", !0, !0, !1), dt("empty", !1, !1, !1), dt("html", !1, !1, !0)) : br = gt, Ar.element = br
        }

        function nt(e, t, n) {
            if (!e) throw Sr("areq", "Argument '{0}' is {1}", t || "?", n || "required");
            return e
        }

        function rt(e, t, n) {
            return n && x(e) && (e = e[e.length - 1]), nt(T(e), t, "not a function, got " + (e && "object" == typeof e ? e.constructor.name || "Object" : typeof e)), e
        }

        function it(e, t) {
            if ("hasOwnProperty" === e) throw Sr("badname", "hasOwnProperty is not a valid {0} name", t)
        }

        function ot(e, t, n) {
            if (!t) return e;
            for (var r, i = t.split("."), o = e, a = i.length, s = 0; a > s; s++) r = i[s], e && (e = (o = e)[r]);
            return !n && T(e) ? z(o, e) : e
        }

        function at(e) {
            var t = e[0],
                n = e[e.length - 1];
            if (t === n) return br(t);
            var r = t,
                i = [r];
            do {
                if (r = r.nextSibling, !r) break;
                i.push(r)
            } while (r !== n);
            return br(i)
        }

        function st(e) {
            function t(e, t, n) {
                return e[t] || (e[t] = n())
            }
            var n = r("$injector"),
                i = r("ng"),
                o = t(e, "angular", Object);
            return o.$$minErr = o.$$minErr || r, t(o, "module", function() {
                var e = {};
                return function(r, o, a) {
                    var s = function(e, t) {
                        if ("hasOwnProperty" === e) throw i("badname", "hasOwnProperty is not a valid {0} name", t)
                    };
                    return s(r, "module"), o && e.hasOwnProperty(r) && (e[r] = null), t(e, r, function() {
                        function e(e, n, r) {
                            return function() {
                                return t[r || "push"]([e, n, arguments]), c
                            }
                        }
                        if (!o) throw n("nomod", "Module '{0}' is not available! You either misspelled the module name or forgot to load it. If registering a module ensure that you specify the dependencies as the second argument.", r);
                        var t = [],
                            i = [],
                            s = e("$injector", "invoke"),
                            c = {
                                _invokeQueue: t,
                                _runBlocks: i,
                                requires: o,
                                name: r,
                                provider: e("$provide", "provider"),
                                factory: e("$provide", "factory"),
                                service: e("$provide", "service"),
                                value: e("$provide", "value"),
                                constant: e("$provide", "constant", "unshift"),
                                animation: e("$animateProvider", "register"),
                                filter: e("$filterProvider", "register"),
                                controller: e("$controllerProvider", "register"),
                                directive: e("$compileProvider", "directive"),
                                config: s,
                                run: function(e) {
                                    return i.push(e), this
                                }
                            };
                        return a && s(a), c
                    })
                }
            })
        }

        function ct(t) {
            d(t, {
                bootstrap: Z,
                copy: I,
                extend: d,
                equals: L,
                element: br,
                forEach: o,
                injector: Ot,
                noop: h,
                bind: z,
                toJson: B,
                fromJson: U,
                identity: g,
                isUndefined: v,
                isDefined: y,
                isString: $,
                isFunction: T,
                isObject: b,
                isNumber: w,
                isElement: j,
                isArray: x,
                version: _r,
                isDate: k,
                lowercase: pr,
                uppercase: gr,
                callbacks: {
                    counter: 0
                },
                $$minErr: r,
                $$csp: P
            }), wr = st(e);
            try {
                wr("ngLocale")
            } catch (n) {
                wr("ngLocale", []).provider("$locale", rn)
            }
            wr("ng", ["ngLocale"], ["$provide",
                function(e) {
                    e.provider({
                        $$sanitizeUri: _n
                    }), e.provider("$compile", zt).directive({
                        a: Ci,
                        input: Ii,
                        textarea: Ii,
                        form: Ni,
                        script: vo,
                        select: $o,
                        style: ko,
                        option: wo,
                        ngBind: Ji,
                        ngBindHtml: Gi,
                        ngBindTemplate: Xi,
                        ngClass: Ki,
                        ngClassEven: Yi,
                        ngClassOdd: Qi,
                        ngCloak: Zi,
                        ngController: eo,
                        ngForm: ji,
                        ngHide: uo,
                        ngIf: no,
                        ngInclude: ro,
                        ngInit: oo,
                        ngNonBindable: ao,
                        ngPluralize: so,
                        ngRepeat: co,
                        ngShow: lo,
                        ngStyle: fo,
                        ngSwitch: po,
                        ngSwitchWhen: ho,
                        ngSwitchDefault: go,
                        ngOptions: bo,
                        ngTransclude: mo,
                        ngModel: zi,
                        ngList: Ui,
                        ngChange: Hi,
                        required: Bi,
                        ngRequired: Bi,
                        ngValue: Vi
                    }).directive({
                        ngInclude: io
                    }).directive(Si).directive(to), e.provider({
                        $anchorScroll: It,
                        $animate: ei,
                        $browser: Pt,
                        $cacheFactory: Ft,
                        $controller: Ut,
                        $document: Wt,
                        $exceptionHandler: Vt,
                        $filter: Hn,
                        $interpolate: tn,
                        $interval: nn,
                        $http: Qt,
                        $httpBackend: Zt,
                        $location: vn,
                        $log: yn,
                        $parse: Sn,
                        $rootScope: jn,
                        $q: An,
                        $sce: Dn,
                        $sceDelegate: In,
                        $sniffer: Ln,
                        $templateCache: Rt,
                        $timeout: Pn,
                        $window: zn,
                        $$rAF: Nn,
                        $$asyncCallback: Dt
                    })
                }
            ])
        }

        function lt() {
            return ++Or
        }

        function ut(e) {
            return e.replace(Lr, function(e, t, n, r) {
                return r ? n.toUpperCase() : n
            }).replace(Pr, "Moz$1")
        }

        function dt(e, t, n, r) {
            function i(e) {
                var i, a, s, c, l, u, d, f = n && e ? [this.filter(e)] : [this],
                    p = t;
                if (!r || null != e)
                    for (; f.length;)
                        for (i = f.shift(), a = 0, s = i.length; s > a; a++)
                            for (c = br(i[a]), p ? c.triggerHandler("$destroy") : p = !p, l = 0, u = (d = c.children()).length; u > l; l++) f.push($r(d[l]));
                return o.apply(this, arguments)
            }
            var o = $r.fn[e];
            o = o.$original || o, i.$original = o, $r.fn[e] = i
        }

        function ft(e) {
            return !zr.test(e)
        }

        function pt(e, t) {
            var n, r, i, o, a, s, c = t.createDocumentFragment(),
                l = [];
            if (ft(e)) l.push(t.createTextNode(e));
            else {
                for (n = c.appendChild(t.createElement("div")), r = (Hr.exec(e) || ["", ""])[1].toLowerCase(), i = Ur[r] || Ur._default, n.innerHTML = "<div>&#160;</div>" + i[1] + e.replace(Br, "<$1></$2>") + i[2], n.removeChild(n.firstChild), o = i[0]; o--;) n = n.lastChild;
                for (a = 0, s = n.childNodes.length; s > a; ++a) l.push(n.childNodes[a]);
                n = c.firstChild, n.textContent = ""
            }
            return c.textContent = "", c.innerHTML = "", l
        }

        function ht(e, n) {
            n = n || t;
            var r;
            return (r = Rr.exec(e)) ? [n.createElement(r[1])] : pt(e, n)
        }

        function gt(e) {
            if (e instanceof gt) return e;
            if ($(e) && (e = Nr(e)), !(this instanceof gt)) {
                if ($(e) && "<" != e.charAt(0)) throw Fr("nosel", "Looking up elements via selectors is not supported by jqLite! See: http://docs.angularjs.org/api/angular.element");
                return new gt(e)
            }
            if ($(e)) {
                Ct(this, ht(e));
                var n = br(t.createDocumentFragment());
                n.append(this)
            } else Ct(this, e)
        }

        function mt(e) {
            return e.cloneNode(!0)
        }

        function vt(e) {
            bt(e);
            for (var t = 0, n = e.childNodes || []; t < n.length; t++) vt(n[t])
        }

        function yt(e, t, n, r) {
            if (y(r)) throw Fr("offargs", "jqLite#off() does not support the `selector` argument");
            var i = $t(e, "events"),
                a = $t(e, "handle");
            a && (v(t) ? o(i, function(t, n) {
                Dr(e, n, t), delete i[n]
            }) : o(t.split(" "), function(t) {
                v(n) ? (Dr(e, t, i[t]), delete i[t]) : O(i[t] || [], n)
            }))
        }

        function bt(e, t) {
            var r = e[Mr],
                i = qr[r];
            if (i) {
                if (t) return void delete qr[r].data[t];
                i.handle && (i.events.$destroy && i.handle({}, "$destroy"), yt(e)), delete qr[r], e[Mr] = n
            }
        }

        function $t(e, t, n) {
            var r = e[Mr],
                i = qr[r || -1];
            return y(n) ? (i || (e[Mr] = r = lt(), i = qr[r] = {}), void(i[t] = n)) : i && i[t]
        }

        function wt(e, t, n) {
            var r = $t(e, "data"),
                i = y(n),
                o = !i && y(t),
                a = o && !b(t);
            if (r || a || $t(e, "data", r = {}), i) r[t] = n;
            else {
                if (!o) return r;
                if (a) return r && r[t];
                d(r, t)
            }
        }

        function kt(e, t) {
            return e.getAttribute ? (" " + (e.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ").indexOf(" " + t + " ") > -1 : !1
        }

        function xt(e, t) {
            t && e.setAttribute && o(t.split(" "), function(t) {
                e.setAttribute("class", Nr((" " + (e.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ").replace(" " + Nr(t) + " ", " ")))
            })
        }

        function Tt(e, t) {
            if (t && e.setAttribute) {
                var n = (" " + (e.getAttribute("class") || "") + " ").replace(/[\n\t]/g, " ");
                o(t.split(" "), function(e) {
                    e = Nr(e), -1 === n.indexOf(" " + e + " ") && (n += e + " ")
                }), e.setAttribute("class", Nr(n))
            }
        }

        function Ct(e, t) {
            if (t) {
                t = t.nodeName || !y(t.length) || S(t) ? [t] : t;
                for (var n = 0; n < t.length; n++) e.push(t[n])
            }
        }

        function St(e, t) {
            return At(e, "$" + (t || "ngController") + "Controller")
        }

        function At(e, t, r) {
            e = br(e), 9 == e[0].nodeType && (e = e.find("html"));
            for (var i = x(t) ? t : [t]; e.length;) {
                for (var o = e[0], a = 0, s = i.length; s > a; a++)
                    if ((r = e.data(i[a])) !== n) return r;
                e = br(o.parentNode || 11 === o.nodeType && o.host)
            }
        }

        function Et(e) {
            for (var t = 0, n = e.childNodes; t < n.length; t++) vt(n[t]);
            for (; e.firstChild;) e.removeChild(e.firstChild)
        }

        function Nt(e, t) {
            var n = Vr[t.toLowerCase()];
            return n && Jr[e.nodeName] && n
        }

        function jt(e, n) {
            var r = function(r, i) {
                if (r.preventDefault || (r.preventDefault = function() {
                    r.returnValue = !1
                }), r.stopPropagation || (r.stopPropagation = function() {
                    r.cancelBubble = !0
                }), r.target || (r.target = r.srcElement || t), v(r.defaultPrevented)) {
                    var a = r.preventDefault;
                    r.preventDefault = function() {
                        r.defaultPrevented = !0, a.call(r)
                    }, r.defaultPrevented = !1
                }
                r.isDefaultPrevented = function() {
                    return r.defaultPrevented || r.returnValue === !1
                };
                var s = D(n[i || r.type] || []);
                o(s, function(t) {
                    t.call(e, r)
                }), 8 >= yr ? (r.preventDefault = null, r.stopPropagation = null, r.isDefaultPrevented = null) : (delete r.preventDefault, delete r.stopPropagation, delete r.isDefaultPrevented)
            };
            return r.elem = e, r
        }

        function _t(e) {
            var t, r = typeof e;
            return "object" == r && null !== e ? "function" == typeof(t = e.$$hashKey) ? t = e.$$hashKey() : t === n && (t = e.$$hashKey = l()) : t = e, r + ":" + t
        }

        function qt(e) {
            o(e, this.put, this)
        }

        function Mt(e) {
            var t, n, r, i;
            return "function" == typeof e ? (t = e.$inject) || (t = [], e.length && (n = e.toString().replace(Qr, ""), r = n.match(Xr), o(r[1].split(Gr), function(e) {
                e.replace(Kr, function(e, n, r) {
                    t.push(r)
                })
            })), e.$inject = t) : x(e) ? (i = e.length - 1, rt(e[i], "fn"), t = e.slice(0, i)) : rt(e, "fn", !0), t
        }

        function Ot(e) {
            function t(e) {
                return function(t, n) {
                    return b(t) ? void o(t, c(e)) : e(t, n)
                }
            }

            function n(e, t) {
                if (it(e, "service"), (T(t) || x(t)) && (t = w.instantiate(t)), !t.$get) throw Yr("pget", "Provider '{0}' must define $get factory method.", e);
                return y[e + p] = t
            }

            function r(e, t) {
                return n(e, {
                    $get: t
                })
            }

            function i(e, t) {
                return r(e, ["$injector",
                    function(e) {
                        return e.instantiate(t)
                    }
                ])
            }

            function a(e, t) {
                return r(e, m(t))
            }

            function s(e, t) {
                it(e, "constant"), y[e] = t, k[e] = t
            }

            function l(e, t) {
                var n = w.get(e + p),
                    r = n.$get;
                n.$get = function() {
                    var e = C.invoke(r, n);
                    return C.invoke(t, null, {
                        $delegate: e
                    })
                }
            }

            function u(e) {
                var t, n, r, i, a = [];
                return o(e, function(e) {
                    if (!v.get(e)) {
                        v.put(e, !0);
                        try {
                            if ($(e))
                                for (t = wr(e), a = a.concat(u(t.requires)).concat(t._runBlocks), n = t._invokeQueue, r = 0, i = n.length; i > r; r++) {
                                    var o = n[r],
                                        s = w.get(o[0]);
                                    s[o[1]].apply(s, o[2])
                                } else T(e) ? a.push(w.invoke(e)) : x(e) ? a.push(w.invoke(e)) : rt(e, "module")
                        } catch (c) {
                            throw x(e) && (e = e[e.length - 1]), c.message && c.stack && -1 == c.stack.indexOf(c.message) && (c = c.message + "\n" + c.stack), Yr("modulerr", "Failed to instantiate module {0} due to:\n{1}", e, c.stack || c.message || c)
                        }
                    }
                }), a
            }

            function d(e, t) {
                function n(n) {
                    if (e.hasOwnProperty(n)) {
                        if (e[n] === f) throw Yr("cdep", "Circular dependency found: {0}", g.join(" <- "));
                        return e[n]
                    }
                    try {
                        return g.unshift(n), e[n] = f, e[n] = t(n)
                    } catch (r) {
                        throw e[n] === f && delete e[n], r
                    } finally {
                        g.shift()
                    }
                }

                function r(e, t, r) {
                    var i, o, a, s = [],
                        c = Mt(e);
                    for (o = 0, i = c.length; i > o; o++) {
                        if (a = c[o], "string" != typeof a) throw Yr("itkn", "Incorrect injection token! Expected service name as string, got {0}", a);
                        s.push(r && r.hasOwnProperty(a) ? r[a] : n(a))
                    }
                    return e.$inject || (e = e[i]), e.apply(t, s)
                }

                function i(e, t) {
                    var n, i, o = function() {};
                    return o.prototype = (x(e) ? e[e.length - 1] : e).prototype, n = new o, i = r(e, n, t), b(i) || T(i) ? i : n
                }
                return {
                    invoke: r,
                    instantiate: i,
                    get: n,
                    annotate: Mt,
                    has: function(t) {
                        return y.hasOwnProperty(t + p) || e.hasOwnProperty(t)
                    }
                }
            }
            var f = {}, p = "Provider",
                g = [],
                v = new qt,
                y = {
                    $provide: {
                        provider: t(n),
                        factory: t(r),
                        service: t(i),
                        value: t(a),
                        constant: t(s),
                        decorator: l
                    }
                }, w = y.$injector = d(y, function() {
                    throw Yr("unpr", "Unknown provider: {0}", g.join(" <- "))
                }),
                k = {}, C = k.$injector = d(k, function(e) {
                    var t = w.get(e + p);
                    return C.invoke(t.$get, t)
                });
            return o(u(e), function(e) {
                C.invoke(e || h)
            }), C
        }

        function It() {
            var e = !0;
            this.disableAutoScrolling = function() {
                e = !1
            }, this.$get = ["$window", "$location", "$rootScope",
                function(t, n, r) {
                    function i(e) {
                        var t = null;
                        return o(e, function(e) {
                            t || "a" !== pr(e.nodeName) || (t = e)
                        }), t
                    }

                    function a() {
                        var e, r = n.hash();
                        r ? (e = s.getElementById(r)) ? e.scrollIntoView() : (e = i(s.getElementsByName(r))) ? e.scrollIntoView() : "top" === r && t.scrollTo(0, 0) : t.scrollTo(0, 0)
                    }
                    var s = t.document;
                    return e && r.$watch(function() {
                        return n.hash()
                    }, function() {
                        r.$evalAsync(a)
                    }), a
                }
            ]
        }

        function Dt() {
            this.$get = ["$$rAF", "$timeout",
                function(e, t) {
                    return e.supported ? function(t) {
                        return e(t)
                    } : function(e) {
                        return t(e, 0, !1)
                    }
                }
            ]
        }

        function Lt(e, t, r, i) {
            function a(e) {
                try {
                    e.apply(null, R(arguments, 1))
                } finally {
                    if (y--, 0 === y)
                        for (; b.length;) try {
                            b.pop()()
                        } catch (t) {
                            r.error(t)
                        }
                }
            }

            function s(e, t) {
                ! function n() {
                    o(k, function(e) {
                        e()
                    }), w = t(n, e)
                }()
            }

            function c() {
                C = null, x != l.url() && (x = l.url(), o(S, function(e) {
                    e(l.url())
                }))
            }
            var l = this,
                u = t[0],
                d = e.location,
                f = e.history,
                p = e.setTimeout,
                g = e.clearTimeout,
                m = {};
            l.isMock = !1;
            var y = 0,
                b = [];
            l.$$completeOutstandingRequest = a, l.$$incOutstandingRequestCount = function() {
                y++
            }, l.notifyWhenNoOutstandingRequests = function(e) {
                o(k, function(e) {
                    e()
                }), 0 === y ? e() : b.push(e)
            };
            var w, k = [];
            l.addPollFn = function(e) {
                return v(w) && s(100, p), k.push(e), e
            };
            var x = d.href,
                T = t.find("base"),
                C = null;
            l.url = function(t, n) {
                if (d !== e.location && (d = e.location), f !== e.history && (f = e.history), t) {
                    if (x == t) return;
                    return x = t, i.history ? n ? f.replaceState(null, "", t) : (f.pushState(null, "", t), T.attr("href", T.attr("href"))) : (C = t, n ? d.replace(t) : d.href = t), l
                }
                return C || d.href.replace(/%27/g, "'")
            };
            var S = [],
                A = !1;
            l.onUrlChange = function(t) {
                return A || (i.history && br(e).on("popstate", c), i.hashchange ? br(e).on("hashchange", c) : l.addPollFn(c), A = !0), S.push(t), t
            }, l.baseHref = function() {
                var e = T.attr("href");
                return e ? e.replace(/^(https?\:)?\/\/[^\/]*/, "") : ""
            };
            var E = {}, N = "",
                j = l.baseHref();
            l.cookies = function(e, t) {
                var i, o, a, s, c;
                if (!e) {
                    if (u.cookie !== N)
                        for (N = u.cookie, o = N.split("; "), E = {}, s = 0; s < o.length; s++) a = o[s], c = a.indexOf("="), c > 0 && (e = unescape(a.substring(0, c)), E[e] === n && (E[e] = unescape(a.substring(c + 1))));
                    return E
                }
                t === n ? u.cookie = escape(e) + "=;path=" + j + ";expires=Thu, 01 Jan 1970 00:00:00 GMT" : $(t) && (i = (u.cookie = escape(e) + "=" + escape(t) + ";path=" + j).length + 1, i > 4096 && r.warn("Cookie '" + e + "' possibly not set or overflowed because it was too large (" + i + " > 4096 bytes)!"))
            }, l.defer = function(e, t) {
                var n;
                return y++, n = p(function() {
                    delete m[n], a(e)
                }, t || 0), m[n] = !0, n
            }, l.defer.cancel = function(e) {
                return m[e] ? (delete m[e], g(e), a(h), !0) : !1
            }
        }

        function Pt() {
            this.$get = ["$window", "$log", "$sniffer", "$document",
                function(e, t, n, r) {
                    return new Lt(e, r, t, n)
                }
            ]
        }

        function Ft() {
            this.$get = function() {
                function e(e, n) {
                    function i(e) {
                        e != f && (p ? p == e && (p = e.n) : p = e, o(e.n, e.p), o(e, f), f = e, f.n = null)
                    }

                    function o(e, t) {
                        e != t && (e && (e.p = t), t && (t.n = e))
                    }
                    if (e in t) throw r("$cacheFactory")("iid", "CacheId '{0}' is already taken!", e);
                    var a = 0,
                        s = d({}, n, {
                            id: e
                        }),
                        c = {}, l = n && n.capacity || Number.MAX_VALUE,
                        u = {}, f = null,
                        p = null;
                    return t[e] = {
                        put: function(e, t) {
                            if (l < Number.MAX_VALUE) {
                                var n = u[e] || (u[e] = {
                                    key: e
                                });
                                i(n)
                            }
                            if (!v(t)) return e in c || a++, c[e] = t, a > l && this.remove(p.key), t
                        },
                        get: function(e) {
                            if (l < Number.MAX_VALUE) {
                                var t = u[e];
                                if (!t) return;
                                i(t)
                            }
                            return c[e]
                        },
                        remove: function(e) {
                            if (l < Number.MAX_VALUE) {
                                var t = u[e];
                                if (!t) return;
                                t == f && (f = t.p), t == p && (p = t.n), o(t.n, t.p), delete u[e]
                            }
                            delete c[e], a--
                        },
                        removeAll: function() {
                            c = {}, a = 0, u = {}, f = p = null
                        },
                        destroy: function() {
                            c = null, s = null, u = null, delete t[e]
                        },
                        info: function() {
                            return d({}, s, {
                                size: a
                            })
                        }
                    }
                }
                var t = {};
                return e.info = function() {
                    var e = {};
                    return o(t, function(t, n) {
                        e[n] = t.info()
                    }), e
                }, e.get = function(e) {
                    return t[e]
                }, e
            }
        }

        function Rt() {
            this.$get = ["$cacheFactory",
                function(e) {
                    return e("templates")
                }
            ]
        }

        function zt(e, r) {
            var i = {}, a = "Directive",
                s = /^\s*directive\:\s*([\d\w\-_]+)\s+(.*)$/,
                l = /(([\d\w\-_]+)(?:\:([^;]+))?;?)/,
                u = /^(on[a-z]+|formaction)$/;
            this.directive = function f(t, n) {
                return it(t, "directive"), $(t) ? (nt(n, "directiveFactory"), i.hasOwnProperty(t) || (i[t] = [], e.factory(t + a, ["$injector", "$exceptionHandler",
                    function(e, n) {
                        var r = [];
                        return o(i[t], function(i, o) {
                            try {
                                var a = e.invoke(i);
                                T(a) ? a = {
                                    compile: m(a)
                                } : !a.compile && a.link && (a.compile = m(a.link)), a.priority = a.priority || 0, a.index = o, a.name = a.name || t, a.require = a.require || a.controller && a.name, a.restrict = a.restrict || "A", r.push(a)
                            } catch (s) {
                                n(s)
                            }
                        }), r
                    }
                ])), i[t].push(n)) : o(t, c(f)), this
            }, this.aHrefSanitizationWhitelist = function(e) {
                return y(e) ? (r.aHrefSanitizationWhitelist(e), this) : r.aHrefSanitizationWhitelist()
            }, this.imgSrcSanitizationWhitelist = function(e) {
                return y(e) ? (r.imgSrcSanitizationWhitelist(e), this) : r.imgSrcSanitizationWhitelist()
            }, this.$get = ["$injector", "$interpolate", "$exceptionHandler", "$http", "$templateCache", "$parse", "$controller", "$rootScope", "$document", "$sce", "$animate", "$$sanitizeUri",
                function(e, r, c, f, h, v, y, w, k, C, S, A) {
                    function E(e, t, n, r, i) {
                        e instanceof br || (e = br(e)), o(e, function(t, n) {
                            3 == t.nodeType && t.nodeValue.match(/\S+/) && (e[n] = t = br(t).wrap("<span></span>").parent()[0])
                        });
                        var a = j(e, t, e, n, r, i);
                        return N(e, "ng-scope"),
                            function(t, n, r) {
                                nt(t, "scope");
                                var i = n ? Wr.clone.call(e) : e;
                                o(r, function(e, t) {
                                    i.data("$" + t + "Controller", e)
                                });
                                for (var s = 0, c = i.length; c > s; s++) {
                                    var l = i[s],
                                        u = l.nodeType;
                                    (1 === u || 9 === u) && i.eq(s).data("$scope", t)
                                }
                                return n && n(i, t), a && a(t, i, i), i
                            }
                    }

                    function N(e, t) {
                        try {
                            e.addClass(t)
                        } catch (n) {}
                    }

                    function j(e, t, r, i, o, a) {
                        function s(e, r, i, o) {
                            var a, s, c, l, u, d, f, p, g, m = r.length,
                                v = new Array(m);
                            for (f = 0; m > f; f++) v[f] = r[f];
                            for (f = 0, g = 0, p = h.length; p > f; g++) c = v[g], a = h[f++], s = h[f++], l = br(c), a ? (a.scope ? (u = e.$new(), l.data("$scope", u)) : u = e, d = a.transclude, d || !o && t ? a(s, u, c, i, _(e, d || t)) : a(s, u, c, i, o)) : s && s(e, c.childNodes, n, o)
                        }
                        for (var c, l, u, d, f, p, h = [], g = 0; g < e.length; g++) c = new Y, l = q(e[g], [], c, 0 === g ? i : n, o), u = l.length ? I(l, e[g], c, t, r, null, [], [], a) : null, u && u.scope && N(br(e[g]), "ng-scope"), f = u && u.terminal || !(d = e[g].childNodes) || !d.length ? null : j(d, u ? u.transclude : t), h.push(u, f), p = p || u || f, a = null;
                        return p ? s : null
                    }

                    function _(e, t) {
                        return function(n, r, i) {
                            var o = !1;
                            n || (n = e.$new(), n.$$transcluded = !0, o = !0);
                            var a = t(n, r, i);
                            return o && a.on("$destroy", z(n, n.$destroy)), a
                        }
                    }

                    function q(e, t, n, r, i) {
                        var o, a, c = e.nodeType,
                            u = n.$attr;
                        switch (c) {
                            case 1:
                                F(t, Ht(kr(e).toLowerCase()), "E", r, i);
                                for (var d, f, p, h, g, m = e.attributes, v = 0, y = m && m.length; y > v; v++) {
                                    var b = !1,
                                        w = !1;
                                    if (d = m[v], !yr || yr >= 8 || d.specified) {
                                        f = d.name, h = Ht(f), it.test(h) && (f = et(h.substr(6), "-"));
                                        var k = h.replace(/(Start|End)$/, "");
                                        h === k + "Start" && (b = f, w = f.substr(0, f.length - 5) + "end", f = f.substr(0, f.length - 6)), p = Ht(f.toLowerCase()), u[p] = f, n[p] = g = Nr(d.value), Nt(e, p) && (n[p] = !0), G(e, t, g, p), F(t, p, "A", r, i, b, w)
                                    }
                                }
                                if (a = e.className, $(a) && "" !== a)
                                    for (; o = l.exec(a);) p = Ht(o[2]), F(t, p, "C", r, i) && (n[p] = Nr(o[3])), a = a.substr(o.index + o[0].length);
                                break;
                            case 3:
                                J(t, e.nodeValue);
                                break;
                            case 8:
                                try {
                                    o = s.exec(e.nodeValue), o && (p = Ht(o[1]), F(t, p, "M", r, i) && (n[p] = Nr(o[2])))
                                } catch (x) {}
                        }
                        return t.sort(U), t
                    }

                    function M(e, t, n) {
                        var r = [],
                            i = 0;
                        if (t && e.hasAttribute && e.hasAttribute(t)) {
                            do {
                                if (!e) throw ti("uterdir", "Unterminated attribute, found '{0}' but no matching '{1}' found.", t, n);
                                1 == e.nodeType && (e.hasAttribute(t) && i++, e.hasAttribute(n) && i--), r.push(e), e = e.nextSibling
                            } while (i > 0)
                        } else r.push(e);
                        return br(r)
                    }

                    function O(e, t, n) {
                        return function(r, i, o, a, s) {
                            return i = M(i[0], t, n), e(r, i, o, a, s)
                        }
                    }

                    function I(e, i, a, s, l, u, d, f, p) {
                        function h(e, t, n, r) {
                            e && (n && (e = O(e, n, r)), e.require = k.require, (F === k || k.$$isolateScope) && (e = Q(e, {
                                isolateScope: !0
                            })), d.push(e)), t && (n && (t = O(t, n, r)), t.require = k.require, (F === k || k.$$isolateScope) && (t = Q(t, {
                                isolateScope: !0
                            })), f.push(t))
                        }

                        function g(e, t, n) {
                            var r, i = "data",
                                a = !1;
                            if ($(e)) {
                                for (;
                                    "^" == (r = e.charAt(0)) || "?" == r;) e = e.substr(1), "^" == r && (i = "inheritedData"), a = a || "?" == r;
                                if (r = null, n && "data" === i && (r = n[e]), r = r || t[i]("$" + e + "Controller"), !r && !a) throw ti("ctreq", "Controller '{0}', required by directive '{1}', can't be found!", e, C);
                                return r
                            }
                            return x(e) && (r = [], o(e, function(e) {
                                r.push(g(e, t, n))
                            })), r
                        }

                        function m(e, t, s, l, u) {
                            function p(e, t) {
                                var r;
                                return arguments.length < 2 && (t = e, e = n), X && (r = C), u(e, t, r)
                            }
                            var h, m, b, $, w, k, x, T, C = {};
                            if (h = i === s ? a : D(a, new Y(br(s), a.$attr)), m = h.$$element, F) {
                                var S = /^\s*([@=&])(\??)\s*(\w*)\s*$/,
                                    A = br(s);
                                x = t.$new(!0), z && z === F.$$originalDirective ? A.data("$isolateScope", x) : A.data("$isolateScopeNoTemplate", x), N(A, "ng-isolate-scope"), o(F.scope, function(e, n) {
                                    var i, o, a, s, c = e.match(S) || [],
                                        l = c[3] || n,
                                        u = "?" == c[2],
                                        d = c[1];
                                    switch (x.$$isolateBindings[n] = d + l, d) {
                                        case "@":
                                            h.$observe(l, function(e) {
                                                x[n] = e
                                            }), h.$$observers[l].$$scope = t, h[l] && (x[n] = r(h[l])(t));
                                            break;
                                        case "=":
                                            if (u && !h[l]) return;
                                            o = v(h[l]), s = o.literal ? L : function(e, t) {
                                                return e === t
                                            }, a = o.assign || function() {
                                                throw i = x[n] = o(t), ti("nonassign", "Expression '{0}' used with directive '{1}' is non-assignable!", h[l], F.name)
                                            }, i = x[n] = o(t), x.$watch(function() {
                                                var e = o(t);
                                                return s(e, x[n]) || (s(e, i) ? a(t, e = x[n]) : x[n] = e), i = e
                                            }, null, o.literal);
                                            break;
                                        case "&":
                                            o = v(h[l]), x[n] = function(e) {
                                                return o(t, e)
                                            };
                                            break;
                                        default:
                                            throw ti("iscp", "Invalid isolate scope definition for directive '{0}'. Definition: {... {1}: '{2}' ...}", F.name, n, e)
                                    }
                                })
                            }
                            for (T = u && p, I && o(I, function(e) {
                                var n, r = {
                                    $scope: e === F || e.$$isolateScope ? x : t,
                                    $element: m,
                                    $attrs: h,
                                    $transclude: T
                                };
                                k = e.controller, "@" == k && (k = h[e.name]), n = y(k, r), C[e.name] = n, X || m.data("$" + e.name + "Controller", n), e.controllerAs && (r.$scope[e.controllerAs] = n)
                            }), b = 0, $ = d.length; $ > b; b++) try {
                                w = d[b], w(w.isolateScope ? x : t, m, h, w.require && g(w.require, m, C), T)
                            } catch (E) {
                                c(E, V(m))
                            }
                            var j = t;
                            for (F && (F.template || null === F.templateUrl) && (j = x), e && e(j, s.childNodes, n, u), b = f.length - 1; b >= 0; b--) try {
                                w = f[b], w(w.isolateScope ? x : t, m, h, w.require && g(w.require, m, C), T)
                            } catch (E) {
                                c(E, V(m))
                            }
                        }
                        p = p || {};
                        for (var w, k, C, S, A, j, _ = -Number.MAX_VALUE, I = p.controllerDirectives, F = p.newIsolateScopeDirective, z = p.templateDirective, U = p.nonTlbTranscludeDirective, J = !1, X = p.hasElementTranscludeDirective, G = a.$$element = br(i), Z = u, et = s, tt = 0, nt = e.length; nt > tt; tt++) {
                            k = e[tt];
                            var it = k.$$start,
                                ot = k.$$end;
                            if (it && (G = M(i, it, ot)), S = n, _ > k.priority) break;
                            if ((j = k.scope) && (w = w || k, k.templateUrl || (W("new/isolated scope", F, k, G), b(j) && (F = k))), C = k.name, !k.templateUrl && k.controller && (j = k.controller, I = I || {}, W("'" + C + "' controller", I[C], k, G), I[C] = k), (j = k.transclude) && (J = !0, k.$$tlb || (W("transclusion", U, k, G), U = k), "element" == j ? (X = !0, _ = k.priority, S = M(i, it, ot), G = a.$$element = br(t.createComment(" " + C + ": " + a[C] + " ")), i = G[0], K(l, br(R(S)), i), et = E(S, s, _, Z && Z.name, {
                                nonTlbTranscludeDirective: U
                            })) : (S = br(mt(i)).contents(), G.empty(), et = E(S, s))), k.template)
                                if (W("template", z, k, G), z = k, j = T(k.template) ? k.template(G, a) : k.template, j = rt(j), k.replace) {
                                    if (Z = k, S = ft(j) ? [] : br(j), i = S[0], 1 != S.length || 1 !== i.nodeType) throw ti("tplrt", "Template for directive '{0}' must have exactly one root element. {1}", C, "");
                                    K(l, G, i);
                                    var at = {
                                            $attr: {}
                                        }, st = q(i, [], at),
                                        ct = e.splice(tt + 1, e.length - (tt + 1));
                                    F && P(st), e = e.concat(st).concat(ct), H(a, at), nt = e.length
                                } else G.html(j);
                            if (k.templateUrl) W("template", z, k, G), z = k, k.replace && (Z = k), m = B(e.splice(tt, e.length - tt), G, a, l, et, d, f, {
                                controllerDirectives: I,
                                newIsolateScopeDirective: F,
                                templateDirective: z,
                                nonTlbTranscludeDirective: U
                            }), nt = e.length;
                            else if (k.compile) try {
                                A = k.compile(G, a, et), T(A) ? h(null, A, it, ot) : A && h(A.pre, A.post, it, ot)
                            } catch (lt) {
                                c(lt, V(G))
                            }
                            k.terminal && (m.terminal = !0, _ = Math.max(_, k.priority))
                        }
                        return m.scope = w && w.scope === !0, m.transclude = J && et, p.hasElementTranscludeDirective = X, m
                    }

                    function P(e) {
                        for (var t = 0, n = e.length; n > t; t++) e[t] = p(e[t], {
                            $$isolateScope: !0
                        })
                    }

                    function F(t, r, o, s, l, u, d) {
                        if (r === l) return null;
                        var f = null;
                        if (i.hasOwnProperty(r))
                            for (var h, g = e.get(r + a), m = 0, v = g.length; v > m; m++) try {
                                h = g[m], (s === n || s > h.priority) && -1 != h.restrict.indexOf(o) && (u && (h = p(h, {
                                    $$start: u,
                                    $$end: d
                                })), t.push(h), f = h)
                            } catch (y) {
                                c(y)
                            }
                        return f
                    }

                    function H(e, t) {
                        var n = t.$attr,
                            r = e.$attr,
                            i = e.$$element;
                        o(e, function(r, i) {
                            "$" != i.charAt(0) && (t[i] && (r += ("style" === i ? ";" : " ") + t[i]), e.$set(i, r, !0, n[i]))
                        }), o(t, function(t, o) {
                            "class" == o ? (N(i, t), e["class"] = (e["class"] ? e["class"] + " " : "") + t) : "style" == o ? (i.attr("style", i.attr("style") + ";" + t), e.style = (e.style ? e.style + ";" : "") + t) : "$" == o.charAt(0) || e.hasOwnProperty(o) || (e[o] = t, r[o] = n[o])
                        })
                    }

                    function B(e, t, n, r, i, a, s, c) {
                        var l, u, p = [],
                            g = t[0],
                            m = e.shift(),
                            v = d({}, m, {
                                templateUrl: null,
                                transclude: null,
                                replace: null,
                                $$originalDirective: m
                            }),
                            y = T(m.templateUrl) ? m.templateUrl(t, n) : m.templateUrl;
                        return t.empty(), f.get(C.getTrustedResourceUrl(y), {
                            cache: h
                        }).success(function(d) {
                            var f, h, $, w;
                            if (d = rt(d), m.replace) {
                                if ($ = ft(d) ? [] : br(d), f = $[0], 1 != $.length || 1 !== f.nodeType) throw ti("tplrt", "Template for directive '{0}' must have exactly one root element. {1}", m.name, y);
                                h = {
                                    $attr: {}
                                }, K(r, t, f);
                                var k = q(f, [], h);
                                b(m.scope) && P(k), e = k.concat(e), H(n, h)
                            } else f = g, t.html(d);
                            for (e.unshift(v), l = I(e, f, n, i, t, m, a, s, c), o(r, function(e, n) {
                                e == f && (r[n] = t[0])
                            }), u = j(t[0].childNodes, i); p.length;) {
                                var x = p.shift(),
                                    T = p.shift(),
                                    C = p.shift(),
                                    S = p.shift(),
                                    A = t[0];
                                if (T !== g) {
                                    var E = T.className;
                                    c.hasElementTranscludeDirective && m.replace || (A = mt(f)), K(C, br(T), A), N(br(A), E)
                                }
                                w = l.transclude ? _(x, l.transclude) : S, l(u, x, A, r, w)
                            }
                            p = null
                        }).error(function(e, t, n, r) {
                            throw ti("tpload", "Failed to load template: {0}", r.url)
                        }),
                            function(e, t, n, r, i) {
                                p ? (p.push(t), p.push(n), p.push(r), p.push(i)) : l(u, t, n, r, i)
                            }
                    }

                    function U(e, t) {
                        var n = t.priority - e.priority;
                        return 0 !== n ? n : e.name !== t.name ? e.name < t.name ? -1 : 1 : e.index - t.index
                    }

                    function W(e, t, n, r) {
                        if (t) throw ti("multidir", "Multiple directives [{0}, {1}] asking for {2} on: {3}", t.name, n.name, e, V(r))
                    }

                    function J(e, t) {
                        var n = r(t, !0);
                        n && e.push({
                            priority: 0,
                            compile: m(function(e, t) {
                                var r = t.parent(),
                                    i = r.data("$binding") || [];
                                i.push(n), N(r.data("$binding", i), "ng-binding"), e.$watch(n, function(e) {
                                    t[0].nodeValue = e
                                })
                            })
                        })
                    }

                    function X(e, t) {
                        if ("srcdoc" == t) return C.HTML;
                        var n = kr(e);
                        return "xlinkHref" == t || "FORM" == n && "action" == t || "IMG" != n && ("src" == t || "ngSrc" == t) ? C.RESOURCE_URL : void 0
                    }

                    function G(e, t, n, i) {
                        var o = r(n, !0);
                        if (o) {
                            if ("multiple" === i && "SELECT" === kr(e)) throw ti("selmulti", "Binding to the 'multiple' attribute is not supported. Element: {0}", V(e));
                            t.push({
                                priority: 100,
                                compile: function() {
                                    return {
                                        pre: function(t, n, a) {
                                            var s = a.$$observers || (a.$$observers = {});
                                            if (u.test(i)) throw ti("nodomevents", "Interpolations for HTML DOM event attributes are disallowed.  Please use the ng- versions (such as ng-click instead of onclick) instead.");
                                            o = r(a[i], !0, X(e, i)), o && (a[i] = o(t), (s[i] || (s[i] = [])).$$inter = !0, (a.$$observers && a.$$observers[i].$$scope || t).$watch(o, function(e, t) {
                                                "class" === i && e != t ? a.$updateClass(e, t) : a.$set(i, e)
                                            }))
                                        }
                                    }
                                }
                            })
                        }
                    }

                    function K(e, n, r) {
                        var i, o, a = n[0],
                            s = n.length,
                            c = a.parentNode;
                        if (e)
                            for (i = 0, o = e.length; o > i; i++)
                                if (e[i] == a) {
                                    e[i++] = r;
                                    for (var l = i, u = l + s - 1, d = e.length; d > l; l++, u++) d > u ? e[l] = e[u] : delete e[l];
                                    e.length -= s - 1;
                                    break
                                }
                        c && c.replaceChild(r, a);
                        var f = t.createDocumentFragment();
                        f.appendChild(a), r[br.expando] = a[br.expando];
                        for (var p = 1, h = n.length; h > p; p++) {
                            var g = n[p];
                            br(g).remove(), f.appendChild(g), delete n[p]
                        }
                        n[0] = r, n.length = 1
                    }

                    function Q(e, t) {
                        return d(function() {
                            return e.apply(null, arguments)
                        }, e, t)
                    }
                    var Y = function(e, t) {
                        this.$$element = e, this.$attr = t || {}
                    };
                    Y.prototype = {
                        $normalize: Ht,
                        $addClass: function(e) {
                            e && e.length > 0 && S.addClass(this.$$element, e)
                        },
                        $removeClass: function(e) {
                            e && e.length > 0 && S.removeClass(this.$$element, e)
                        },
                        $updateClass: function(e, t) {
                            var n = Bt(e, t),
                                r = Bt(t, e);
                            0 === n.length ? S.removeClass(this.$$element, r) : 0 === r.length ? S.addClass(this.$$element, n) : S.setClass(this.$$element, n, r)
                        },
                        $set: function(e, t, r, i) {
                            var a, s = Nt(this.$$element[0], e);
                            s && (this.$$element.prop(e, t), i = s), this[e] = t, i ? this.$attr[e] = i : (i = this.$attr[e], i || (this.$attr[e] = i = et(e, "-"))), a = kr(this.$$element), ("A" === a && "href" === e || "IMG" === a && "src" === e) && (this[e] = t = A(t, "src" === e)), r !== !1 && (null === t || t === n ? this.$$element.removeAttr(i) : this.$$element.attr(i, t));
                            var l = this.$$observers;
                            l && o(l[e], function(e) {
                                try {
                                    e(t)
                                } catch (n) {
                                    c(n)
                                }
                            })
                        },
                        $observe: function(e, t) {
                            var n = this,
                                r = n.$$observers || (n.$$observers = {}),
                                i = r[e] || (r[e] = []);
                            return i.push(t), w.$evalAsync(function() {
                                i.$$inter || t(n[e])
                            }), t
                        }
                    };
                    var Z = r.startSymbol(),
                        tt = r.endSymbol(),
                        rt = "{{" == Z || "}}" == tt ? g : function(e) {
                            return e.replace(/\{\{/g, Z).replace(/}}/g, tt)
                        }, it = /^ngAttr[A-Z]/;
                    return E
                }
            ]
        }

        function Ht(e) {
            return ut(e.replace(ni, ""))
        }

        function Bt(e, t) {
            var n = "",
                r = e.split(/\s+/),
                i = t.split(/\s+/);
            e: for (var o = 0; o < r.length; o++) {
                for (var a = r[o], s = 0; s < i.length; s++)
                    if (a == i[s]) continue e;
                n += (n.length > 0 ? " " : "") + a
            }
            return n
        }

        function Ut() {
            var e = {}, t = /^(\S+)(\s+as\s+(\w+))?$/;
            this.register = function(t, n) {
                it(t, "controller"), b(t) ? d(e, t) : e[t] = n
            }, this.$get = ["$injector", "$window",
                function(n, i) {
                    return function(o, a) {
                        var s, c, l, u;
                        if ($(o) && (c = o.match(t), l = c[1], u = c[3], o = e.hasOwnProperty(l) ? e[l] : ot(a.$scope, l, !0) || ot(i, l, !0), rt(o, l, !0)), s = n.instantiate(o, a), u) {
                            if (!a || "object" != typeof a.$scope) throw r("$controller")("noscp", "Cannot export controller '{0}' as '{1}'! No $scope object provided via `locals`.", l || o.name, u);
                            a.$scope[u] = s
                        }
                        return s
                    }
                }
            ]
        }

        function Wt() {
            this.$get = ["$window",
                function(e) {
                    return br(e.document)
                }
            ]
        }

        function Vt() {
            this.$get = ["$log",
                function(e) {
                    return function() {
                        e.error.apply(e, arguments)
                    }
                }
            ]
        }

        function Jt(e) {
            var t, n, r, i = {};
            return e ? (o(e.split("\n"), function(e) {
                r = e.indexOf(":"), t = pr(Nr(e.substr(0, r))), n = Nr(e.substr(r + 1)), t && (i[t] ? i[t] += ", " + n : i[t] = n)
            }), i) : i
        }

        function Xt(e) {
            var t = b(e) ? e : n;
            return function(n) {
                return t || (t = Jt(e)), n ? t[pr(n)] || null : t
            }
        }

        function Gt(e, t, n) {
            return T(n) ? n(e, t) : (o(n, function(n) {
                e = n(e, t)
            }), e)
        }

        function Kt(e) {
            return e >= 200 && 300 > e
        }

        function Qt() {
            var e = /^\s*(\[|\{[^\{])/,
                t = /[\}\]]\s*$/,
                r = /^\)\]\}',?\n/,
                i = {
                    "Content-Type": "application/json;charset=utf-8"
                }, a = this.defaults = {
                    transformResponse: [
                        function(n) {
                            return $(n) && (n = n.replace(r, ""), e.test(n) && t.test(n) && (n = U(n))), n
                        }
                    ],
                    transformRequest: [
                        function(e) {
                            return !b(e) || E(e) || N(e) ? e : B(e)
                        }
                    ],
                    headers: {
                        common: {
                            Accept: "application/json, text/plain, */*"
                        },
                        post: I(i),
                        put: I(i),
                        patch: I(i)
                    },
                    xsrfCookieName: "XSRF-TOKEN",
                    xsrfHeaderName: "X-XSRF-TOKEN"
                }, c = this.interceptors = [],
                l = this.responseInterceptors = [];
            this.$get = ["$httpBackend", "$browser", "$cacheFactory", "$rootScope", "$q", "$injector",
                function(e, t, r, i, u, f) {
                    function p(e) {
                        function r(e) {
                            var t = d({}, e, {
                                data: Gt(e.data, e.headers, s.transformResponse)
                            });
                            return Kt(e.status) ? t : u.reject(t)
                        }

                        function i(e) {
                            function t(e) {
                                var t;
                                o(e, function(n, r) {
                                    T(n) && (t = n(), null != t ? e[r] = t : delete e[r])
                                })
                            }
                            var n, r, i, s = a.headers,
                                c = d({}, e.headers);
                            s = d({}, s.common, s[pr(e.method)]), t(s), t(c);
                            e: for (n in s) {
                                r = pr(n);
                                for (i in c)
                                    if (pr(i) === r) continue e;
                                c[n] = s[n]
                            }
                            return c
                        }
                        var s = {
                            method: "get",
                            transformRequest: a.transformRequest,
                            transformResponse: a.transformResponse
                        }, c = i(e);
                        d(s, e), s.headers = c, s.method = gr(s.method);
                        var l = Rn(s.url) ? t.cookies()[s.xsrfCookieName || a.xsrfCookieName] : n;
                        l && (c[s.xsrfHeaderName || a.xsrfHeaderName] = l);
                        var f = function(e) {
                                c = e.headers;
                                var t = Gt(e.data, Xt(c), e.transformRequest);
                                return v(e.data) && o(c, function(e, t) {
                                    "content-type" === pr(t) && delete c[t]
                                }), v(e.withCredentials) && !v(a.withCredentials) && (e.withCredentials = a.withCredentials), m(e, t, c).then(r, r)
                            }, p = [f, n],
                            h = u.when(s);
                        for (o(C, function(e) {
                            (e.request || e.requestError) && p.unshift(e.request, e.requestError), (e.response || e.responseError) && p.push(e.response, e.responseError)
                        }); p.length;) {
                            var g = p.shift(),
                                y = p.shift();
                            h = h.then(g, y)
                        }
                        return h.success = function(e) {
                            return h.then(function(t) {
                                e(t.data, t.status, t.headers, s)
                            }), h
                        }, h.error = function(e) {
                            return h.then(null, function(t) {
                                e(t.data, t.status, t.headers, s)
                            }), h
                        }, h
                    }

                    function h() {
                        o(arguments, function(e) {
                            p[e] = function(t, n) {
                                return p(d(n || {}, {
                                    method: e,
                                    url: t
                                }))
                            }
                        })
                    }

                    function g() {
                        o(arguments, function(e) {
                            p[e] = function(t, n, r) {
                                return p(d(r || {}, {
                                    method: e,
                                    url: t,
                                    data: n
                                }))
                            }
                        })
                    }

                    function m(t, n, r) {
                        function o(e, t, n, r) {
                            l && (Kt(e) ? l.put(g, [e, t, Jt(n), r]) : l.remove(g)), s(t, e, n, r), i.$$phase || i.$apply()
                        }

                        function s(e, n, r, i) {
                            n = Math.max(n, 0), (Kt(n) ? f.resolve : f.reject)({
                                data: e,
                                status: n,
                                headers: Xt(r),
                                config: t,
                                statusText: i
                            })
                        }

                        function c() {
                            var e = M(p.pendingRequests, t); - 1 !== e && p.pendingRequests.splice(e, 1)
                        }
                        var l, d, f = u.defer(),
                            h = f.promise,
                            g = w(t.url, t.params);
                        if (p.pendingRequests.push(t), h.then(c, c), (t.cache || a.cache) && t.cache !== !1 && "GET" == t.method && (l = b(t.cache) ? t.cache : b(a.cache) ? a.cache : k), l)
                            if (d = l.get(g), y(d)) {
                                if (d.then) return d.then(c, c), d;
                                x(d) ? s(d[1], d[0], I(d[2]), d[3]) : s(d, 200, {}, "OK")
                            } else l.put(g, h);
                        return v(d) && e(t.method, g, n, o, r, t.timeout, t.withCredentials, t.responseType), h
                    }

                    function w(e, t) {
                        if (!t) return e;
                        var n = [];
                        return s(t, function(e, t) {
                            null === e || v(e) || (x(e) || (e = [e]), o(e, function(e) {
                                b(e) && (e = B(e)), n.push(Q(t) + "=" + Q(e))
                            }))
                        }), n.length > 0 && (e += (-1 == e.indexOf("?") ? "?" : "&") + n.join("&")), e
                    }
                    var k = r("$http"),
                        C = [];
                    return o(c, function(e) {
                        C.unshift($(e) ? f.get(e) : f.invoke(e))
                    }), o(l, function(e, t) {
                        var n = $(e) ? f.get(e) : f.invoke(e);
                        C.splice(t, 0, {
                            response: function(e) {
                                return n(u.when(e))
                            },
                            responseError: function(e) {
                                return n(u.reject(e))
                            }
                        })
                    }), p.pendingRequests = [], h("get", "delete", "head", "jsonp"), g("post", "put"), p.defaults = a, p
                }
            ]
        }

        function Yt(t) {
            if (8 >= yr && (!t.match(/^(get|post|head|put|delete|options)$/i) || !e.XMLHttpRequest)) return new e.ActiveXObject("Microsoft.XMLHTTP");
            if (e.XMLHttpRequest) return new e.XMLHttpRequest;
            throw r("$httpBackend")("noxhr", "This browser does not support XMLHttpRequest.")
        }

        function Zt() {
            this.$get = ["$browser", "$window", "$document",
                function(e, t, n) {
                    return en(e, Yt, e.defer, t.angular.callbacks, n[0])
                }
            ]
        }

        function en(e, t, n, r, i) {
            function a(e, t) {
                var n = i.createElement("script"),
                    r = function() {
                        n.onreadystatechange = n.onload = n.onerror = null, i.body.removeChild(n), t && t()
                    };
                return n.type = "text/javascript", n.src = e, yr && 8 >= yr ? n.onreadystatechange = function() {
                    /loaded|complete/.test(n.readyState) && r()
                } : n.onload = n.onerror = function() {
                    r()
                }, i.body.appendChild(n), r
            }
            var s = -1;
            return function(i, c, l, u, d, f, p, g) {
                function m() {
                    b = s, w && w(), k && k.abort()
                }

                function v(t, r, i, o, a) {
                    T && n.cancel(T), w = k = null, 0 === r && (r = i ? 200 : "file" == Fn(c).protocol ? 404 : 0), r = 1223 === r ? 204 : r, a = a || "", t(r, i, o, a), e.$$completeOutstandingRequest(h)
                }
                var b;
                if (e.$$incOutstandingRequestCount(), c = c || e.url(), "jsonp" == pr(i)) {
                    var $ = "_" + (r.counter++).toString(36);
                    r[$] = function(e) {
                        r[$].data = e
                    };
                    var w = a(c.replace("JSON_CALLBACK", "angular.callbacks." + $), function() {
                        r[$].data ? v(u, 200, r[$].data) : v(u, b || -2), r[$] = Ar.noop
                    })
                } else {
                    var k = t(i);
                    if (k.open(i, c, !0), o(d, function(e, t) {
                        y(e) && k.setRequestHeader(t, e)
                    }), k.onreadystatechange = function() {
                        if (k && 4 == k.readyState) {
                            var e = null,
                                t = null;
                            b !== s && (e = k.getAllResponseHeaders(), t = "response" in k ? k.response : k.responseText), v(u, b || k.status, t, e, k.statusText || "")
                        }
                    }, p && (k.withCredentials = !0), g) try {
                        k.responseType = g
                    } catch (x) {
                        if ("json" !== g) throw x
                    }
                    k.send(l || null)
                } if (f > 0) var T = n(m, f);
                else f && f.then && f.then(m)
            }
        }

        function tn() {
            var e = "{{",
                t = "}}";
            this.startSymbol = function(t) {
                return t ? (e = t, this) : e
            }, this.endSymbol = function(e) {
                return e ? (t = e, this) : t
            }, this.$get = ["$parse", "$exceptionHandler", "$sce",
                function(n, r, i) {
                    function o(o, c, l) {
                        for (var u, d, f, p, h = 0, g = [], m = o.length, y = !1, b = []; m > h;) - 1 != (u = o.indexOf(e, h)) && -1 != (d = o.indexOf(t, u + a)) ? (h != u && g.push(o.substring(h, u)), g.push(f = n(p = o.substring(u + a, d))), f.exp = p, h = d + s, y = !0) : (h != m && g.push(o.substring(h)), h = m);
                        if ((m = g.length) || (g.push(""), m = 1), l && g.length > 1) throw ri("noconcat", "Error while interpolating: {0}\nStrict Contextual Escaping disallows interpolations that concatenate multiple expressions when a trusted value is required.  See http://docs.angularjs.org/api/ng.$sce", o);
                        return !c || y ? (b.length = m, f = function(e) {
                            try {
                                for (var t, n = 0, a = m; a > n; n++) "function" == typeof(t = g[n]) && (t = t(e), t = l ? i.getTrusted(l, t) : i.valueOf(t), null === t || v(t) ? t = "" : "string" != typeof t && (t = B(t))), b[n] = t;
                                return b.join("")
                            } catch (s) {
                                var c = ri("interr", "Can't interpolate: {0}\n{1}", o, s.toString());
                                r(c)
                            }
                        }, f.exp = o, f.parts = g, f) : void 0
                    }
                    var a = e.length,
                        s = t.length;
                    return o.startSymbol = function() {
                        return e
                    }, o.endSymbol = function() {
                        return t
                    }, o
                }
            ]
        }

        function nn() {
            this.$get = ["$rootScope", "$window", "$q",
                function(e, t, n) {
                    function r(r, o, a, s) {
                        var c = t.setInterval,
                            l = t.clearInterval,
                            u = n.defer(),
                            d = u.promise,
                            f = 0,
                            p = y(s) && !s;
                        return a = y(a) ? a : 0, d.then(null, null, r), d.$$intervalId = c(function() {
                            u.notify(f++), a > 0 && f >= a && (u.resolve(f), l(d.$$intervalId), delete i[d.$$intervalId]), p || e.$apply()
                        }, o), i[d.$$intervalId] = u, d
                    }
                    var i = {};
                    return r.cancel = function(e) {
                        return e && e.$$intervalId in i ? (i[e.$$intervalId].reject("canceled"), clearInterval(e.$$intervalId), delete i[e.$$intervalId], !0) : !1
                    }, r
                }
            ]
        }

        function rn() {
            this.$get = function() {
                return {
                    id: "en-us",
                    NUMBER_FORMATS: {
                        DECIMAL_SEP: ".",
                        GROUP_SEP: ",",
                        PATTERNS: [{
                            minInt: 1,
                            minFrac: 0,
                            maxFrac: 3,
                            posPre: "",
                            posSuf: "",
                            negPre: "-",
                            negSuf: "",
                            gSize: 3,
                            lgSize: 3
                        }, {
                            minInt: 1,
                            minFrac: 2,
                            maxFrac: 2,
                            posPre: "Â¤",
                            posSuf: "",
                            negPre: "(Â¤",
                            negSuf: ")",
                            gSize: 3,
                            lgSize: 3
                        }],
                        CURRENCY_SYM: "$"
                    },
                    DATETIME_FORMATS: {
                        MONTH: "January,February,March,April,May,June,July,August,September,October,November,December".split(","),
                        SHORTMONTH: "Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec".split(","),
                        DAY: "Sunday,Monday,Tuesday,Wednesday,Thursday,Friday,Saturday".split(","),
                        SHORTDAY: "Sun,Mon,Tue,Wed,Thu,Fri,Sat".split(","),
                        AMPMS: ["AM", "PM"],
                        medium: "MMM d, y h:mm:ss a",
                        "short": "M/d/yy h:mm a",
                        fullDate: "EEEE, MMMM d, y",
                        longDate: "MMMM d, y",
                        mediumDate: "MMM d, y",
                        shortDate: "M/d/yy",
                        mediumTime: "h:mm:ss a",
                        shortTime: "h:mm a"
                    },
                    pluralCat: function(e) {
                        return 1 === e ? "one" : "other"
                    }
                }
            }
        }

        function on(e) {
            for (var t = e.split("/"), n = t.length; n--;) t[n] = K(t[n]);
            return t.join("/")
        }

        function an(e, t, n) {
            var r = Fn(e, n);
            t.$$protocol = r.protocol, t.$$host = r.hostname, t.$$port = f(r.port) || oi[r.protocol] || null
        }

        function sn(e, t, n) {
            var r = "/" !== e.charAt(0);
            r && (e = "/" + e);
            var i = Fn(e, n);
            t.$$path = decodeURIComponent(r && "/" === i.pathname.charAt(0) ? i.pathname.substring(1) : i.pathname), t.$$search = X(i.search), t.$$hash = decodeURIComponent(i.hash), t.$$path && "/" != t.$$path.charAt(0) && (t.$$path = "/" + t.$$path)
        }

        function cn(e, t) {
            return 0 === t.indexOf(e) ? t.substr(e.length) : void 0
        }

        function ln(e) {
            var t = e.indexOf("#");
            return -1 == t ? e : e.substr(0, t)
        }

        function un(e) {
            return e.substr(0, ln(e).lastIndexOf("/") + 1)
        }

        function dn(e) {
            return e.substring(0, e.indexOf("/", e.indexOf("//") + 2))
        }

        function fn(e, t) {
            this.$$html5 = !0, t = t || "";
            var r = un(e);
            an(e, this, e), this.$$parse = function(t) {
                var n = cn(r, t);
                if (!$(n)) throw ai("ipthprfx", 'Invalid url "{0}", missing path prefix "{1}".', t, r);
                sn(n, this, e), this.$$path || (this.$$path = "/"), this.$$compose()
            }, this.$$compose = function() {
                var e = G(this.$$search),
                    t = this.$$hash ? "#" + K(this.$$hash) : "";
                this.$$url = on(this.$$path) + (e ? "?" + e : "") + t, this.$$absUrl = r + this.$$url.substr(1)
            }, this.$$rewrite = function(i) {
                var o, a;
                return (o = cn(e, i)) !== n ? (a = o, (o = cn(t, o)) !== n ? r + (cn("/", o) || o) : e + a) : (o = cn(r, i)) !== n ? r + o : r == i + "/" ? r : void 0
            }
        }

        function pn(e, t) {
            var n = un(e);
            an(e, this, e), this.$$parse = function(r) {
                function i(e, t, n) {
                    var r, i = /^\/?.*?:(\/.*)/;
                    return 0 === t.indexOf(n) && (t = t.replace(n, "")), i.exec(t) ? e : (r = i.exec(e), r ? r[1] : e)
                }
                var o = cn(e, r) || cn(n, r),
                    a = "#" == o.charAt(0) ? cn(t, o) : this.$$html5 ? o : "";
                if (!$(a)) throw ai("ihshprfx", 'Invalid url "{0}", missing hash prefix "{1}".', r, t);
                sn(a, this, e), this.$$path = i(this.$$path, a, e), this.$$compose()
            }, this.$$compose = function() {
                var n = G(this.$$search),
                    r = this.$$hash ? "#" + K(this.$$hash) : "";
                this.$$url = on(this.$$path) + (n ? "?" + n : "") + r, this.$$absUrl = e + (this.$$url ? t + this.$$url : "")
            }, this.$$rewrite = function(t) {
                return ln(e) == ln(t) ? t : void 0
            }
        }

        function hn(e, t) {
            this.$$html5 = !0, pn.apply(this, arguments);
            var n = un(e);
            this.$$rewrite = function(r) {
                var i;
                return e == ln(r) ? r : (i = cn(n, r)) ? e + t + i : n === r + "/" ? n : void 0
            }
        }

        function gn(e) {
            return function() {
                return this[e]
            }
        }

        function mn(e, t) {
            return function(n) {
                return v(n) ? this[e] : (this[e] = t(n), this.$$compose(), this)
            }
        }

        function vn() {
            var t = "",
                n = !1;
            this.hashPrefix = function(e) {
                return y(e) ? (t = e, this) : t
            }, this.html5Mode = function(e) {
                return y(e) ? (n = e, this) : n
            }, this.$get = ["$rootScope", "$browser", "$sniffer", "$rootElement",
                function(r, i, o, a) {
                    function s(e) {
                        r.$broadcast("$locationChangeSuccess", c.absUrl(), e)
                    }
                    var c, l, u, d = i.baseHref(),
                        f = i.url();
                    n ? (u = dn(f) + (d || "/"), l = o.history ? fn : hn) : (u = ln(f), l = pn), c = new l(u, "#" + t), c.$$parse(c.$$rewrite(f)), a.on("click", function(t) {
                        if (!t.ctrlKey && !t.metaKey && 2 != t.which) {
                            for (var n = br(t.target);
                                 "a" !== pr(n[0].nodeName);)
                                if (n[0] === a[0] || !(n = n.parent())[0]) return;
                            var o = n.prop("href");
                            b(o) && "[object SVGAnimatedString]" === o.toString() && (o = Fn(o.animVal).href);
                            var s = c.$$rewrite(o);
                            o && !n.attr("target") && s && !t.isDefaultPrevented() && (t.preventDefault(), s != i.url() && (c.$$parse(s), r.$apply(), e.angular["ff-684208-preventDefault"] = !0))
                        }
                    }), c.absUrl() != f && i.url(c.absUrl(), !0), i.onUrlChange(function(e) {
                        c.absUrl() != e && (r.$evalAsync(function() {
                            var t = c.absUrl();
                            c.$$parse(e), r.$broadcast("$locationChangeStart", e, t).defaultPrevented ? (c.$$parse(t), i.url(t)) : s(t)
                        }), r.$$phase || r.$digest())
                    });
                    var p = 0;
                    return r.$watch(function() {
                        var e = i.url(),
                            t = c.$$replace;
                        return p && e == c.absUrl() || (p++, r.$evalAsync(function() {
                            r.$broadcast("$locationChangeStart", c.absUrl(), e).defaultPrevented ? c.$$parse(e) : (i.url(c.absUrl(), t), s(e))
                        })), c.$$replace = !1, p
                    }), c
                }
            ]
        }

        function yn() {
            var e = !0,
                t = this;
            this.debugEnabled = function(t) {
                return y(t) ? (e = t, this) : e
            }, this.$get = ["$window",
                function(n) {
                    function r(e) {
                        return e instanceof Error && (e.stack ? e = e.message && -1 === e.stack.indexOf(e.message) ? "Error: " + e.message + "\n" + e.stack : e.stack : e.sourceURL && (e = e.message + "\n" + e.sourceURL + ":" + e.line)), e
                    }

                    function i(e) {
                        var t = n.console || {}, i = t[e] || t.log || h,
                            a = !1;
                        try {
                            a = !! i.apply
                        } catch (s) {}
                        return a ? function() {
                            var e = [];
                            return o(arguments, function(t) {
                                e.push(r(t))
                            }), i.apply(t, e)
                        } : function(e, t) {
                            i(e, null == t ? "" : t)
                        }
                    }
                    return {
                        log: i("log"),
                        info: i("info"),
                        warn: i("warn"),
                        error: i("error"),
                        debug: function() {
                            var n = i("debug");
                            return function() {
                                e && n.apply(t, arguments)
                            }
                        }()
                    }
                }
            ]
        }

        function bn(e, t) {
            if ("constructor" === e) throw ci("isecfld", 'Referencing "constructor" field in Angular expressions is disallowed! Expression: {0}', t);
            return e
        }

        function $n(e, t) {
            if (e) {
                if (e.constructor === e) throw ci("isecfn", "Referencing Function in Angular expressions is disallowed! Expression: {0}", t);
                if (e.document && e.location && e.alert && e.setInterval) throw ci("isecwindow", "Referencing the Window in Angular expressions is disallowed! Expression: {0}", t);
                if (e.children && (e.nodeName || e.prop && e.attr && e.find)) throw ci("isecdom", "Referencing DOM nodes in Angular expressions is disallowed! Expression: {0}", t)
            }
            return e
        }

        function wn(e, t, r, i, o) {
            o = o || {};
            for (var a, s = t.split("."), c = 0; s.length > 1; c++) {
                a = bn(s.shift(), i);
                var l = e[a];
                l || (l = {}, e[a] = l), e = l, e.then && o.unwrapPromises && (si(i), "$$v" in e || ! function(e) {
                    e.then(function(t) {
                        e.$$v = t
                    })
                }(e), e.$$v === n && (e.$$v = {}), e = e.$$v)
            }
            return a = bn(s.shift(), i), e[a] = r, r
        }

        function kn(e, t, r, i, o, a, s) {
            return bn(e, a), bn(t, a), bn(r, a), bn(i, a), bn(o, a), s.unwrapPromises ? function(s, c) {
                var l, u = c && c.hasOwnProperty(e) ? c : s;
                return null == u ? u : (u = u[e], u && u.then && (si(a), "$$v" in u || (l = u, l.$$v = n, l.then(function(e) {
                    l.$$v = e
                })), u = u.$$v), t ? null == u ? n : (u = u[t], u && u.then && (si(a), "$$v" in u || (l = u, l.$$v = n, l.then(function(e) {
                    l.$$v = e
                })), u = u.$$v), r ? null == u ? n : (u = u[r], u && u.then && (si(a), "$$v" in u || (l = u, l.$$v = n, l.then(function(e) {
                    l.$$v = e
                })), u = u.$$v), i ? null == u ? n : (u = u[i], u && u.then && (si(a), "$$v" in u || (l = u, l.$$v = n, l.then(function(e) {
                    l.$$v = e
                })), u = u.$$v), o ? null == u ? n : (u = u[o], u && u.then && (si(a), "$$v" in u || (l = u, l.$$v = n, l.then(function(e) {
                    l.$$v = e
                })), u = u.$$v), u) : u) : u) : u) : u)
            } : function(a, s) {
                var c = s && s.hasOwnProperty(e) ? s : a;
                return null == c ? c : (c = c[e], t ? null == c ? n : (c = c[t], r ? null == c ? n : (c = c[r], i ? null == c ? n : (c = c[i], o ? null == c ? n : c = c[o] : c) : c) : c) : c)
            }
        }

        function xn(e, t) {
            return bn(e, t),
                function(t, r) {
                    return null == t ? n : (r && r.hasOwnProperty(e) ? r : t)[e]
                }
        }

        function Tn(e, t, r) {
            return bn(e, r), bn(t, r),
                function(r, i) {
                    return null == r ? n : (r = (i && i.hasOwnProperty(e) ? i : r)[e], null == r ? n : r[t])
                }
        }

        function Cn(e, t, r) {
            if (hi.hasOwnProperty(e)) return hi[e];
            var i, a = e.split("."),
                s = a.length;
            if (t.unwrapPromises || 1 !== s)
                if (t.unwrapPromises || 2 !== s)
                    if (t.csp) i = 6 > s ? kn(a[0], a[1], a[2], a[3], a[4], r, t) : function(e, i) {
                        var o, c = 0;
                        do o = kn(a[c++], a[c++], a[c++], a[c++], a[c++], r, t)(e, i), i = n, e = o; while (s > c);
                        return o
                    };
                    else {
                        var c = "var p;\n";
                        o(a, function(e, n) {
                            bn(e, r), c += "if(s == null) return undefined;\ns=" + (n ? "s" : '((k&&k.hasOwnProperty("' + e + '"))?k:s)') + '["' + e + '"];\n' + (t.unwrapPromises ? 'if (s && s.then) {\n pw("' + r.replace(/(["\r\n])/g, "\\$1") + '");\n if (!("$$v" in s)) {\n p=s;\n p.$$v = undefined;\n p.then(function(v) {p.$$v=v;});\n}\n s=s.$$v\n}\n' : "")
                        }), c += "return s;";
                        var l = new Function("s", "k", "pw", c);
                        l.toString = m(c), i = t.unwrapPromises ? function(e, t) {
                            return l(e, t, si)
                        } : l
                    } else i = Tn(a[0], a[1], r);
            else i = xn(a[0], r);
            return "hasOwnProperty" !== e && (hi[e] = i), i
        }

        function Sn() {
            var e = {}, t = {
                csp: !1,
                unwrapPromises: !1,
                logPromiseWarnings: !0
            };
            this.unwrapPromises = function(e) {
                return y(e) ? (t.unwrapPromises = !! e, this) : t.unwrapPromises
            }, this.logPromiseWarnings = function(e) {
                return y(e) ? (t.logPromiseWarnings = e, this) : t.logPromiseWarnings
            }, this.$get = ["$filter", "$sniffer", "$log",
                function(n, r, i) {
                    return t.csp = r.csp, si = function(e) {
                        t.logPromiseWarnings && !li.hasOwnProperty(e) && (li[e] = !0, i.warn("[$parse] Promise found in the expression `" + e + "`. Automatic unwrapping of promises in Angular expressions is deprecated."))
                    },
                        function(r) {
                            var i;
                            switch (typeof r) {
                                case "string":
                                    if (e.hasOwnProperty(r)) return e[r];
                                    var o = new fi(t),
                                        a = new pi(o, n, t);
                                    return i = a.parse(r, !1), "hasOwnProperty" !== r && (e[r] = i), i;
                                case "function":
                                    return r;
                                default:
                                    return h
                            }
                        }
                }
            ]
        }

        function An() {
            this.$get = ["$rootScope", "$exceptionHandler",
                function(e, t) {
                    return En(function(t) {
                        e.$evalAsync(t)
                    }, t)
                }
            ]
        }

        function En(e, t) {
            function r(e) {
                return e
            }

            function i(e) {
                return l(e)
            }

            function a(e) {
                var t = s(),
                    n = 0,
                    r = x(e) ? [] : {};
                return o(e, function(e, i) {
                    n++, c(e).then(function(e) {
                        r.hasOwnProperty(i) || (r[i] = e, --n || t.resolve(r))
                    }, function(e) {
                        r.hasOwnProperty(i) || t.reject(e)
                    })
                }), 0 === n && t.resolve(r), t.promise
            }
            var s = function() {
                var o, a, l = [];
                return a = {
                    resolve: function(t) {
                        if (l) {
                            var r = l;
                            l = n, o = c(t), r.length && e(function() {
                                for (var e, t = 0, n = r.length; n > t; t++) e = r[t], o.then(e[0], e[1], e[2])
                            })
                        }
                    },
                    reject: function(e) {
                        a.resolve(u(e))
                    },
                    notify: function(t) {
                        if (l) {
                            var n = l;
                            l.length && e(function() {
                                for (var e, r = 0, i = n.length; i > r; r++) e = n[r], e[2](t)
                            })
                        }
                    },
                    promise: {
                        then: function(e, n, a) {
                            var c = s(),
                                u = function(n) {
                                    try {
                                        c.resolve((T(e) ? e : r)(n))
                                    } catch (i) {
                                        c.reject(i), t(i)
                                    }
                                }, d = function(e) {
                                    try {
                                        c.resolve((T(n) ? n : i)(e))
                                    } catch (r) {
                                        c.reject(r), t(r)
                                    }
                                }, f = function(e) {
                                    try {
                                        c.notify((T(a) ? a : r)(e))
                                    } catch (n) {
                                        t(n)
                                    }
                                };
                            return l ? l.push([u, d, f]) : o.then(u, d, f), c.promise
                        },
                        "catch": function(e) {
                            return this.then(null, e)
                        },
                        "finally": function(e) {
                            function t(e, t) {
                                var n = s();
                                return t ? n.resolve(e) : n.reject(e), n.promise
                            }

                            function n(n, i) {
                                var o = null;
                                try {
                                    o = (e || r)()
                                } catch (a) {
                                    return t(a, !1)
                                }
                                return o && T(o.then) ? o.then(function() {
                                    return t(n, i)
                                }, function(e) {
                                    return t(e, !1)
                                }) : t(n, i)
                            }
                            return this.then(function(e) {
                                return n(e, !0)
                            }, function(e) {
                                return n(e, !1)
                            })
                        }
                    }
                }
            }, c = function(t) {
                return t && T(t.then) ? t : {
                    then: function(n) {
                        var r = s();
                        return e(function() {
                            r.resolve(n(t))
                        }), r.promise
                    }
                }
            }, l = function(e) {
                var t = s();
                return t.reject(e), t.promise
            }, u = function(n) {
                return {
                    then: function(r, o) {
                        var a = s();
                        return e(function() {
                            try {
                                a.resolve((T(o) ? o : i)(n))
                            } catch (e) {
                                a.reject(e), t(e)
                            }
                        }), a.promise
                    }
                }
            }, d = function(n, o, a, u) {
                var d, f = s(),
                    p = function(e) {
                        try {
                            return (T(o) ? o : r)(e)
                        } catch (n) {
                            return t(n), l(n)
                        }
                    }, h = function(e) {
                        try {
                            return (T(a) ? a : i)(e)
                        } catch (n) {
                            return t(n), l(n)
                        }
                    }, g = function(e) {
                        try {
                            return (T(u) ? u : r)(e)
                        } catch (n) {
                            t(n)
                        }
                    };
                return e(function() {
                    c(n).then(function(e) {
                        d || (d = !0, f.resolve(c(e).then(p, h, g)))
                    }, function(e) {
                        d || (d = !0, f.resolve(h(e)))
                    }, function(e) {
                        d || f.notify(g(e))
                    })
                }), f.promise
            };
            return {
                defer: s,
                reject: l,
                when: d,
                all: a
            }
        }

        function Nn() {
            this.$get = ["$window", "$timeout",
                function(e, t) {
                    var n = e.requestAnimationFrame || e.webkitRequestAnimationFrame || e.mozRequestAnimationFrame,
                        r = e.cancelAnimationFrame || e.webkitCancelAnimationFrame || e.mozCancelAnimationFrame || e.webkitCancelRequestAnimationFrame,
                        i = !! n,
                        o = i ? function(e) {
                            var t = n(e);
                            return function() {
                                r(t)
                            }
                        } : function(e) {
                            var n = t(e, 16.66, !1);
                            return function() {
                                t.cancel(n)
                            }
                        };
                    return o.supported = i, o
                }
            ]
        }

        function jn() {
            var e = 10,
                t = r("$rootScope"),
                n = null;
            this.digestTtl = function(t) {
                return arguments.length && (e = t), e
            }, this.$get = ["$injector", "$exceptionHandler", "$parse", "$browser",
                function(r, a, s, c) {
                    function u() {
                        this.$id = l(), this.$$phase = this.$parent = this.$$watchers = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = null, this["this"] = this.$root = this, this.$$destroyed = !1, this.$$asyncQueue = [], this.$$postDigestQueue = [], this.$$listeners = {}, this.$$listenerCount = {}, this.$$isolateBindings = {}
                    }

                    function d(e) {
                        if (v.$$phase) throw t("inprog", "{0} already in progress", v.$$phase);
                        v.$$phase = e
                    }

                    function f() {
                        v.$$phase = null
                    }

                    function p(e, t) {
                        var n = s(e);
                        return rt(n, t), n
                    }

                    function g(e, t, n) {
                        do e.$$listenerCount[n] -= t, 0 === e.$$listenerCount[n] && delete e.$$listenerCount[n]; while (e = e.$parent)
                    }

                    function m() {}
                    u.prototype = {
                        constructor: u,
                        $new: function(e) {
                            var t, n;
                            return e ? (n = new u, n.$root = this.$root, n.$$asyncQueue = this.$$asyncQueue, n.$$postDigestQueue = this.$$postDigestQueue) : (t = function() {}, t.prototype = this, n = new t, n.$id = l()), n["this"] = n, n.$$listeners = {}, n.$$listenerCount = {}, n.$parent = this, n.$$watchers = n.$$nextSibling = n.$$childHead = n.$$childTail = null, n.$$prevSibling = this.$$childTail, this.$$childHead ? (this.$$childTail.$$nextSibling = n, this.$$childTail = n) : this.$$childHead = this.$$childTail = n, n
                        },
                        $watch: function(e, t, r) {
                            var i = this,
                                o = p(e, "watch"),
                                a = i.$$watchers,
                                s = {
                                    fn: t,
                                    last: m,
                                    get: o,
                                    exp: e,
                                    eq: !! r
                                };
                            if (n = null, !T(t)) {
                                var c = p(t || h, "listener");
                                s.fn = function(e, t, n) {
                                    c(n)
                                }
                            }
                            if ("string" == typeof e && o.constant) {
                                var l = s.fn;
                                s.fn = function(e, t, n) {
                                    l.call(this, e, t, n), O(a, s)
                                }
                            }
                            return a || (a = i.$$watchers = []), a.unshift(s),
                                function() {
                                    O(a, s), n = null
                                }
                        },
                        $watchCollection: function(e, t) {
                            function n() {
                                o = f(l);
                                var e, t;
                                if (b(o))
                                    if (i(o)) {
                                        a !== p && (a = p, m = a.length = 0, d++), e = o.length, m !== e && (d++, a.length = m = e);
                                        for (var n = 0; e > n; n++) {
                                            var r = a[n] !== a[n] && o[n] !== o[n];
                                            r || a[n] === o[n] || (d++, a[n] = o[n])
                                        }
                                    } else {
                                        a !== h && (a = h = {}, m = 0, d++), e = 0;
                                        for (t in o) o.hasOwnProperty(t) && (e++, a.hasOwnProperty(t) ? a[t] !== o[t] && (d++, a[t] = o[t]) : (m++, a[t] = o[t], d++));
                                        if (m > e) {
                                            d++;
                                            for (t in a) a.hasOwnProperty(t) && !o.hasOwnProperty(t) && (m--, delete a[t])
                                        }
                                    } else a !== o && (a = o, d++);
                                return d
                            }

                            function r() {
                                if (g ? (g = !1, t(o, o, l)) : t(o, c, l), u)
                                    if (b(o))
                                        if (i(o)) {
                                            c = new Array(o.length);
                                            for (var e = 0; e < o.length; e++) c[e] = o[e]
                                        } else {
                                            c = {};
                                            for (var n in o) hr.call(o, n) && (c[n] = o[n])
                                        } else c = o
                            }
                            var o, a, c, l = this,
                                u = t.length > 1,
                                d = 0,
                                f = s(e),
                                p = [],
                                h = {}, g = !0,
                                m = 0;
                            return this.$watch(n, r)
                        },
                        $digest: function() {
                            var r, i, o, s, c, l, u, p, h, g, v, y = this.$$asyncQueue,
                                b = this.$$postDigestQueue,
                                $ = e,
                                w = this,
                                k = [];
                            d("$digest"), n = null;
                            do {
                                for (l = !1, p = w; y.length;) {
                                    try {
                                        v = y.shift(), v.scope.$eval(v.expression)
                                    } catch (x) {
                                        f(), a(x)
                                    }
                                    n = null
                                }
                                e: do {
                                    if (s = p.$$watchers)
                                        for (c = s.length; c--;) try {
                                            if (r = s[c])
                                                if ((i = r.get(p)) === (o = r.last) || (r.eq ? L(i, o) : "number" == typeof i && "number" == typeof o && isNaN(i) && isNaN(o))) {
                                                    if (r === n) {
                                                        l = !1;
                                                        break e
                                                    }
                                                } else l = !0, n = r, r.last = r.eq ? I(i) : i, r.fn(i, o === m ? i : o, p), 5 > $ && (h = 4 - $, k[h] || (k[h] = []), g = T(r.exp) ? "fn: " + (r.exp.name || r.exp.toString()) : r.exp, g += "; newVal: " + B(i) + "; oldVal: " + B(o), k[h].push(g))
                                        } catch (x) {
                                            f(), a(x)
                                        }
                                    if (!(u = p.$$childHead || p !== w && p.$$nextSibling))
                                        for (; p !== w && !(u = p.$$nextSibling);) p = p.$parent
                                } while (p = u);
                                if ((l || y.length) && !$--) throw f(), t("infdig", "{0} $digest() iterations reached. Aborting!\nWatchers fired in the last 5 iterations: {1}", e, B(k))
                            } while (l || y.length);
                            for (f(); b.length;) try {
                                b.shift()()
                            } catch (x) {
                                a(x)
                            }
                        },
                        $destroy: function() {
                            if (!this.$$destroyed) {
                                var e = this.$parent;
                                this.$broadcast("$destroy"), this.$$destroyed = !0, this !== v && (o(this.$$listenerCount, z(null, g, this)), e.$$childHead == this && (e.$$childHead = this.$$nextSibling), e.$$childTail == this && (e.$$childTail = this.$$prevSibling), this.$$prevSibling && (this.$$prevSibling.$$nextSibling = this.$$nextSibling), this.$$nextSibling && (this.$$nextSibling.$$prevSibling = this.$$prevSibling), this.$parent = this.$$nextSibling = this.$$prevSibling = this.$$childHead = this.$$childTail = this.$root = null, this.$$listeners = {}, this.$$watchers = this.$$asyncQueue = this.$$postDigestQueue = [], this.$destroy = this.$digest = this.$apply = h, this.$on = this.$watch = function() {
                                    return h
                                })
                            }
                        },
                        $eval: function(e, t) {
                            return s(e)(this, t)
                        },
                        $evalAsync: function(e) {
                            v.$$phase || v.$$asyncQueue.length || c.defer(function() {
                                v.$$asyncQueue.length && v.$digest()
                            }), this.$$asyncQueue.push({
                                scope: this,
                                expression: e
                            })
                        },
                        $$postDigest: function(e) {
                            this.$$postDigestQueue.push(e)
                        },
                        $apply: function(e) {
                            try {
                                return d("$apply"), this.$eval(e)
                            } catch (t) {
                                a(t)
                            } finally {
                                f();
                                try {
                                    v.$digest()
                                } catch (t) {
                                    throw a(t), t
                                }
                            }
                        },
                        $on: function(e, t) {
                            var n = this.$$listeners[e];
                            n || (this.$$listeners[e] = n = []), n.push(t);
                            var r = this;
                            do r.$$listenerCount[e] || (r.$$listenerCount[e] = 0), r.$$listenerCount[e]++; while (r = r.$parent);
                            var i = this;
                            return function() {
                                n[M(n, t)] = null, g(i, 1, e)
                            }
                        },
                        $emit: function(e) {
                            var t, n, r, i = [],
                                o = this,
                                s = !1,
                                c = {
                                    name: e,
                                    targetScope: o,
                                    stopPropagation: function() {
                                        s = !0
                                    },
                                    preventDefault: function() {
                                        c.defaultPrevented = !0
                                    },
                                    defaultPrevented: !1
                                }, l = F([c], arguments, 1);
                            do {
                                for (t = o.$$listeners[e] || i, c.currentScope = o, n = 0, r = t.length; r > n; n++)
                                    if (t[n]) try {
                                        t[n].apply(null, l)
                                    } catch (u) {
                                        a(u)
                                    } else t.splice(n, 1), n--, r--;
                                if (s) return c;
                                o = o.$parent
                            } while (o);
                            return c
                        },
                        $broadcast: function(e) {
                            for (var t, n, r, i = this, o = i, s = i, c = {
                                name: e,
                                targetScope: i,
                                preventDefault: function() {
                                    c.defaultPrevented = !0
                                },
                                defaultPrevented: !1
                            }, l = F([c], arguments, 1); o = s;) {
                                for (c.currentScope = o, t = o.$$listeners[e] || [], n = 0, r = t.length; r > n; n++)
                                    if (t[n]) try {
                                        t[n].apply(null, l)
                                    } catch (u) {
                                        a(u)
                                    } else t.splice(n, 1), n--, r--;
                                if (!(s = o.$$listenerCount[e] && o.$$childHead || o !== i && o.$$nextSibling))
                                    for (; o !== i && !(s = o.$$nextSibling);) o = o.$parent
                            }
                            return c
                        }
                    };
                    var v = new u;
                    return v
                }
            ]
        }

        function _n() {
            var e = /^\s*(https?|ftp|mailto|tel|file):/,
                t = /^\s*(https?|ftp|file):|data:image\//;
            this.aHrefSanitizationWhitelist = function(t) {
                return y(t) ? (e = t, this) : e
            }, this.imgSrcSanitizationWhitelist = function(e) {
                return y(e) ? (t = e, this) : t
            }, this.$get = function() {
                return function(n, r) {
                    var i, o = r ? t : e;
                    return yr && !(yr >= 8) || (i = Fn(n).href, "" === i || i.match(o)) ? n : "unsafe:" + i
                }
            }
        }

        function qn(e) {
            return e.replace(/([-()\[\]{}+?*.$\^|,:#<!\\])/g, "\\$1").replace(/\x08/g, "\\x08")
        }

        function Mn(e) {
            if ("self" === e) return e;
            if ($(e)) {
                if (e.indexOf("***") > -1) throw gi("iwcard", "Illegal sequence *** in string matcher.  String: {0}", e);
                return e = qn(e).replace("\\*\\*", ".*").replace("\\*", "[^:/.?&;]*"), new RegExp("^" + e + "$")
            }
            if (C(e)) return new RegExp("^" + e.source + "$");
            throw gi("imatcher", 'Matchers may only be "self", string patterns or RegExp objects')
        }

        function On(e) {
            var t = [];
            return y(e) && o(e, function(e) {
                t.push(Mn(e))
            }), t
        }

        function In() {
            this.SCE_CONTEXTS = mi;
            var e = ["self"],
                t = [];
            this.resourceUrlWhitelist = function(t) {
                return arguments.length && (e = On(t)), e
            }, this.resourceUrlBlacklist = function(e) {
                return arguments.length && (t = On(e)), t
            }, this.$get = ["$injector",
                function(r) {
                    function i(e, t) {
                        return "self" === e ? Rn(t) : !! e.exec(t.href)
                    }

                    function o(n) {
                        var r, o, a = Fn(n.toString()),
                            s = !1;
                        for (r = 0, o = e.length; o > r; r++)
                            if (i(e[r], a)) {
                                s = !0;
                                break
                            }
                        if (s)
                            for (r = 0, o = t.length; o > r; r++)
                                if (i(t[r], a)) {
                                    s = !1;
                                    break
                                }
                        return s
                    }

                    function a(e) {
                        var t = function(e) {
                            this.$$unwrapTrustedValue = function() {
                                return e
                            }
                        };
                        return e && (t.prototype = new e), t.prototype.valueOf = function() {
                            return this.$$unwrapTrustedValue()
                        }, t.prototype.toString = function() {
                            return this.$$unwrapTrustedValue().toString()
                        }, t
                    }

                    function s(e, t) {
                        var r = f.hasOwnProperty(e) ? f[e] : null;
                        if (!r) throw gi("icontext", "Attempted to trust a value in invalid context. Context: {0}; Value: {1}", e, t);
                        if (null === t || t === n || "" === t) return t;
                        if ("string" != typeof t) throw gi("itype", "Attempted to trust a non-string value in a content requiring a string: Context: {0}", e);
                        return new r(t)
                    }

                    function c(e) {
                        return e instanceof d ? e.$$unwrapTrustedValue() : e
                    }

                    function l(e, t) {
                        if (null === t || t === n || "" === t) return t;
                        var r = f.hasOwnProperty(e) ? f[e] : null;
                        if (r && t instanceof r) return t.$$unwrapTrustedValue();
                        if (e === mi.RESOURCE_URL) {
                            if (o(t)) return t;
                            throw gi("insecurl", "Blocked loading resource from url not allowed by $sceDelegate policy.  URL: {0}", t.toString())
                        }
                        if (e === mi.HTML) return u(t);
                        throw gi("unsafe", "Attempting to use an unsafe value in a safe context.")
                    }
                    var u = function() {
                        throw gi("unsafe", "Attempting to use an unsafe value in a safe context.")
                    };
                    r.has("$sanitize") && (u = r.get("$sanitize"));
                    var d = a(),
                        f = {};
                    return f[mi.HTML] = a(d), f[mi.CSS] = a(d), f[mi.URL] = a(d), f[mi.JS] = a(d), f[mi.RESOURCE_URL] = a(f[mi.URL]), {
                        trustAs: s,
                        getTrusted: l,
                        valueOf: c
                    }
                }
            ]
        }

        function Dn() {
            var e = !0;
            this.enabled = function(t) {
                return arguments.length && (e = !! t), e
            }, this.$get = ["$parse", "$sniffer", "$sceDelegate",
                function(t, n, r) {
                    if (e && n.msie && n.msieDocumentMode < 8) throw gi("iequirks", "Strict Contextual Escaping does not support Internet Explorer version < 9 in quirks mode.  You can fix this by adding the text <!doctype html> to the top of your HTML document.  See http://docs.angularjs.org/api/ng.$sce for more information.");
                    var i = I(mi);
                    i.isEnabled = function() {
                        return e
                    }, i.trustAs = r.trustAs, i.getTrusted = r.getTrusted, i.valueOf = r.valueOf, e || (i.trustAs = i.getTrusted = function(e, t) {
                        return t
                    }, i.valueOf = g), i.parseAs = function(e, n) {
                        var r = t(n);
                        return r.literal && r.constant ? r : function(t, n) {
                            return i.getTrusted(e, r(t, n))
                        }
                    };
                    var a = i.parseAs,
                        s = i.getTrusted,
                        c = i.trustAs;
                    return o(mi, function(e, t) {
                        var n = pr(t);
                        i[ut("parse_as_" + n)] = function(t) {
                            return a(e, t)
                        }, i[ut("get_trusted_" + n)] = function(t) {
                            return s(e, t)
                        }, i[ut("trust_as_" + n)] = function(t) {
                            return c(e, t)
                        }
                    }), i
                }
            ]
        }

        function Ln() {
            this.$get = ["$window", "$document",
                function(e, t) {
                    var n, r, i = {}, o = f((/android (\d+)/.exec(pr((e.navigator || {}).userAgent)) || [])[1]),
                        a = /Boxee/i.test((e.navigator || {}).userAgent),
                        s = t[0] || {}, c = s.documentMode,
                        l = /^(Moz|webkit|O|ms)(?=[A-Z])/,
                        u = s.body && s.body.style,
                        d = !1,
                        p = !1;
                    if (u) {
                        for (var h in u)
                            if (r = l.exec(h)) {
                                n = r[0], n = n.substr(0, 1).toUpperCase() + n.substr(1);
                                break
                            }
                        n || (n = "WebkitOpacity" in u && "webkit"), d = !! ("transition" in u || n + "Transition" in u), p = !! ("animation" in u || n + "Animation" in u), !o || d && p || (d = $(s.body.style.webkitTransition), p = $(s.body.style.webkitAnimation))
                    }
                    return {
                        history: !(!e.history || !e.history.pushState || 4 > o || a),
                        hashchange: "onhashchange" in e && (!c || c > 7),
                        hasEvent: function(e) {
                            if ("input" == e && 9 == yr) return !1;
                            if (v(i[e])) {
                                var t = s.createElement("div");
                                i[e] = "on" + e in t
                            }
                            return i[e]
                        },
                        csp: P(),
                        vendorPrefix: n,
                        transitions: d,
                        animations: p,
                        android: o,
                        msie: yr,
                        msieDocumentMode: c
                    }
                }
            ]
        }

        function Pn() {
            this.$get = ["$rootScope", "$browser", "$q", "$exceptionHandler",
                function(e, t, n, r) {
                    function i(i, a, s) {
                        var c, l = n.defer(),
                            u = l.promise,
                            d = y(s) && !s;
                        return c = t.defer(function() {
                            try {
                                l.resolve(i())
                            } catch (t) {
                                l.reject(t), r(t)
                            } finally {
                                delete o[u.$$timeoutId]
                            }
                            d || e.$apply()
                        }, a), u.$$timeoutId = c, o[c] = l, u
                    }
                    var o = {};
                    return i.cancel = function(e) {
                        return e && e.$$timeoutId in o ? (o[e.$$timeoutId].reject("canceled"), delete o[e.$$timeoutId], t.defer.cancel(e.$$timeoutId)) : !1
                    }, i
                }
            ]
        }

        function Fn(e) {
            var t = e;
            return yr && (vi.setAttribute("href", t), t = vi.href), vi.setAttribute("href", t), {
                href: vi.href,
                protocol: vi.protocol ? vi.protocol.replace(/:$/, "") : "",
                host: vi.host,
                search: vi.search ? vi.search.replace(/^\?/, "") : "",
                hash: vi.hash ? vi.hash.replace(/^#/, "") : "",
                hostname: vi.hostname,
                port: vi.port,
                pathname: "/" === vi.pathname.charAt(0) ? vi.pathname : "/" + vi.pathname
            }
        }

        function Rn(e) {
            var t = $(e) ? Fn(e) : e;
            return t.protocol === yi.protocol && t.host === yi.host
        }

        function zn() {
            this.$get = m(e)
        }

        function Hn(e) {
            function t(r, i) {
                if (b(r)) {
                    var a = {};
                    return o(r, function(e, n) {
                        a[n] = t(n, e)
                    }), a
                }
                return e.factory(r + n, i)
            }
            var n = "Filter";
            this.register = t, this.$get = ["$injector",
                function(e) {
                    return function(t) {
                        return e.get(t + n)
                    }
                }
            ], t("currency", Un), t("date", Yn), t("filter", Bn), t("json", Zn), t("limitTo", er), t("lowercase", xi), t("number", Wn), t("orderBy", tr), t("uppercase", Ti)
        }

        function Bn() {
            return function(e, t, n) {
                if (!x(e)) return e;
                var r = typeof n,
                    i = [];
                i.check = function(e) {
                    for (var t = 0; t < i.length; t++)
                        if (!i[t](e)) return !1;
                    return !0
                }, "function" !== r && (n = "boolean" === r && n ? function(e, t) {
                    return Ar.equals(e, t)
                } : function(e, t) {
                    if (e && t && "object" == typeof e && "object" == typeof t) {
                        for (var r in e)
                            if ("$" !== r.charAt(0) && hr.call(e, r) && n(e[r], t[r])) return !0;
                        return !1
                    }
                    return t = ("" + t).toLowerCase(), ("" + e).toLowerCase().indexOf(t) > -1
                });
                var o = function(e, t) {
                    if ("string" == typeof t && "!" === t.charAt(0)) return !o(e, t.substr(1));
                    switch (typeof e) {
                        case "boolean":
                        case "number":
                        case "string":
                            return n(e, t);
                        case "object":
                            switch (typeof t) {
                                case "object":
                                    return n(e, t);
                                default:
                                    for (var r in e)
                                        if ("$" !== r.charAt(0) && o(e[r], t)) return !0
                            }
                            return !1;
                        case "array":
                            for (var i = 0; i < e.length; i++)
                                if (o(e[i], t)) return !0;
                            return !1;
                        default:
                            return !1
                    }
                };
                switch (typeof t) {
                    case "boolean":
                    case "number":
                    case "string":
                        t = {
                            $: t
                        };
                    case "object":
                        for (var a in t)! function(e) {
                            "undefined" != typeof t[e] && i.push(function(n) {
                                return o("$" == e ? n : n && n[e], t[e])
                            })
                        }(a);
                        break;
                    case "function":
                        i.push(t);
                        break;
                    default:
                        return e
                }
                for (var s = [], c = 0; c < e.length; c++) {
                    var l = e[c];
                    i.check(l) && s.push(l)
                }
                return s
            }
        }

        function Un(e) {
            var t = e.NUMBER_FORMATS;
            return function(e, n) {
                return v(n) && (n = t.CURRENCY_SYM), Vn(e, t.PATTERNS[1], t.GROUP_SEP, t.DECIMAL_SEP, 2).replace(/\u00A4/g, n)
            }
        }

        function Wn(e) {
            var t = e.NUMBER_FORMATS;
            return function(e, n) {
                return Vn(e, t.PATTERNS[0], t.GROUP_SEP, t.DECIMAL_SEP, n)
            }
        }

        function Vn(e, t, n, r, i) {
            if (null == e || !isFinite(e) || b(e)) return "";
            var o = 0 > e;
            e = Math.abs(e);
            var a = e + "",
                s = "",
                c = [],
                l = !1;
            if (-1 !== a.indexOf("e")) {
                var u = a.match(/([\d\.]+)e(-?)(\d+)/);
                u && "-" == u[2] && u[3] > i + 1 ? a = "0" : (s = a, l = !0)
            }
            if (l) i > 0 && e > -1 && 1 > e && (s = e.toFixed(i));
            else {
                var d = (a.split(bi)[1] || "").length;
                v(i) && (i = Math.min(Math.max(t.minFrac, d), t.maxFrac));
                var f = Math.pow(10, i);
                e = Math.round(e * f) / f;
                var p = ("" + e).split(bi),
                    h = p[0];
                p = p[1] || "";
                var g, m = 0,
                    y = t.lgSize,
                    $ = t.gSize;
                if (h.length >= y + $)
                    for (m = h.length - y, g = 0; m > g; g++)(m - g) % $ === 0 && 0 !== g && (s += n), s += h.charAt(g);
                for (g = m; g < h.length; g++)(h.length - g) % y === 0 && 0 !== g && (s += n), s += h.charAt(g);
                for (; p.length < i;) p += "0";
                i && "0" !== i && (s += r + p.substr(0, i))
            }
            return c.push(o ? t.negPre : t.posPre), c.push(s), c.push(o ? t.negSuf : t.posSuf), c.join("")
        }

        function Jn(e, t, n) {
            var r = "";
            for (0 > e && (r = "-", e = -e), e = "" + e; e.length < t;) e = "0" + e;
            return n && (e = e.substr(e.length - t)), r + e
        }

        function Xn(e, t, n, r) {
            return n = n || 0,
                function(i) {
                    var o = i["get" + e]();
                    return (n > 0 || o > -n) && (o += n), 0 === o && -12 == n && (o = 12), Jn(o, t, r)
                }
        }

        function Gn(e, t) {
            return function(n, r) {
                var i = n["get" + e](),
                    o = gr(t ? "SHORT" + e : e);
                return r[o][i]
            }
        }

        function Kn(e) {
            var t = -1 * e.getTimezoneOffset(),
                n = t >= 0 ? "+" : "";
            return n += Jn(Math[t > 0 ? "floor" : "ceil"](t / 60), 2) + Jn(Math.abs(t % 60), 2)
        }

        function Qn(e, t) {
            return e.getHours() < 12 ? t.AMPMS[0] : t.AMPMS[1]
        }

        function Yn(e) {
            function t(e) {
                var t;
                if (t = e.match(n)) {
                    var r = new Date(0),
                        i = 0,
                        o = 0,
                        a = t[8] ? r.setUTCFullYear : r.setFullYear,
                        s = t[8] ? r.setUTCHours : r.setHours;
                    t[9] && (i = f(t[9] + t[10]), o = f(t[9] + t[11])), a.call(r, f(t[1]), f(t[2]) - 1, f(t[3]));
                    var c = f(t[4] || 0) - i,
                        l = f(t[5] || 0) - o,
                        u = f(t[6] || 0),
                        d = Math.round(1e3 * parseFloat("0." + (t[7] || 0)));
                    return s.call(r, c, l, u, d), r
                }
                return e
            }
            var n = /^(\d{4})-?(\d\d)-?(\d\d)(?:T(\d\d)(?::?(\d\d)(?::?(\d\d)(?:\.(\d+))?)?)?(Z|([+-])(\d\d):?(\d\d))?)?$/;
            return function(n, r) {
                var i, a, s = "",
                    c = [];
                if (r = r || "mediumDate", r = e.DATETIME_FORMATS[r] || r, $(n) && (n = ki.test(n) ? f(n) : t(n)), w(n) && (n = new Date(n)), !k(n)) return n;
                for (; r;) a = wi.exec(r), a ? (c = F(c, a, 1), r = c.pop()) : (c.push(r), r = null);
                return o(c, function(t) {
                    i = $i[t], s += i ? i(n, e.DATETIME_FORMATS) : t.replace(/(^'|'$)/g, "").replace(/''/g, "'")
                }), s
            }
        }

        function Zn() {
            return function(e) {
                return B(e, !0)
            }
        }

        function er() {
            return function(e, t) {
                if (!x(e) && !$(e)) return e;
                if (t = f(t), $(e)) return t ? t >= 0 ? e.slice(0, t) : e.slice(t, e.length) : "";
                var n, r, i = [];
                for (t > e.length ? t = e.length : t < -e.length && (t = -e.length), t > 0 ? (n = 0, r = t) : (n = e.length + t, r = e.length); r > n; n++) i.push(e[n]);
                return i
            }
        }

        function tr(e) {
            return function(t, n, r) {
                function i(e, t) {
                    for (var r = 0; r < n.length; r++) {
                        var i = n[r](e, t);
                        if (0 !== i) return i
                    }
                    return 0
                }

                function o(e, t) {
                    return W(t) ? function(t, n) {
                        return e(n, t)
                    } : e
                }

                function a(e, t) {
                    var n = typeof e,
                        r = typeof t;
                    return n == r ? ("string" == n && (e = e.toLowerCase(), t = t.toLowerCase()), e === t ? 0 : t > e ? -1 : 1) : r > n ? -1 : 1
                }
                if (!x(t)) return t;
                if (!n) return t;
                n = x(n) ? n : [n], n = _(n, function(t) {
                    var n = !1,
                        r = t || g;
                    if ($(t) && (("+" == t.charAt(0) || "-" == t.charAt(0)) && (n = "-" == t.charAt(0), t = t.substring(1)), r = e(t), r.constant)) {
                        var i = r();
                        return o(function(e, t) {
                            return a(e[i], t[i])
                        }, n)
                    }
                    return o(function(e, t) {
                        return a(r(e), r(t))
                    }, n)
                });
                for (var s = [], c = 0; c < t.length; c++) s.push(t[c]);
                return s.sort(o(i, r))
            }
        }

        function nr(e) {
            return T(e) && (e = {
                link: e
            }), e.restrict = e.restrict || "AC", m(e)
        }

        function rr(e, t, n, r) {
            function i(t, n) {
                n = n ? "-" + et(n, "-") : "", r.removeClass(e, (t ? Li : Di) + n), r.addClass(e, (t ? Di : Li) + n)
            }
            var a = this,
                s = e.parent().controller("form") || Ai,
                c = 0,
                l = a.$error = {}, u = [];
            a.$name = t.name || t.ngForm, a.$dirty = !1, a.$pristine = !0, a.$valid = !0, a.$invalid = !1, s.$addControl(a), e.addClass(Pi), i(!0), a.$addControl = function(e) {
                it(e.$name, "input"), u.push(e), e.$name && (a[e.$name] = e)
            }, a.$removeControl = function(e) {
                e.$name && a[e.$name] === e && delete a[e.$name], o(l, function(t, n) {
                    a.$setValidity(n, !0, e)
                }), O(u, e)
            }, a.$setValidity = function(e, t, n) {
                var r = l[e];
                if (t) r && (O(r, n), r.length || (c--, c || (i(t), a.$valid = !0, a.$invalid = !1), l[e] = !1, i(!0, e), s.$setValidity(e, !0, a)));
                else {
                    if (c || i(t), r) {
                        if (q(r, n)) return
                    } else l[e] = r = [], c++, i(!1, e), s.$setValidity(e, !1, a);
                    r.push(n), a.$valid = !1, a.$invalid = !0
                }
            }, a.$setDirty = function() {
                r.removeClass(e, Pi), r.addClass(e, Fi), a.$dirty = !0, a.$pristine = !1, s.$setDirty()
            }, a.$setPristine = function() {
                r.removeClass(e, Fi), r.addClass(e, Pi), a.$dirty = !1, a.$pristine = !0, o(u, function(e) {
                    e.$setPristine()
                })
            }
        }

        function ir(e, t, r, i) {
            return e.$setValidity(t, r), r ? i : n
        }

        function or(e, t, n) {
            var r = n.prop("validity");
            if (b(r)) {
                var i = function(n) {
                    return e.$error[t] || !(r.badInput || r.customError || r.typeMismatch) || r.valueMissing ? n : void e.$setValidity(t, !1)
                };
                e.$parsers.push(i)
            }
        }

        function ar(e, t, n, i, o, a) {
            var s = t.prop("validity");
            if (!o.android) {
                var c = !1;
                t.on("compositionstart", function() {
                    c = !0
                }), t.on("compositionend", function() {
                    c = !1, l()
                })
            }
            var l = function() {
                if (!c) {
                    var r = t.val();
                    W(n.ngTrim || "T") && (r = Nr(r)), (i.$viewValue !== r || s && "" === r && !s.valueMissing) && (e.$$phase ? i.$setViewValue(r) : e.$apply(function() {
                        i.$setViewValue(r)
                    }))
                }
            };
            if (o.hasEvent("input")) t.on("input", l);
            else {
                var u, d = function() {
                    u || (u = a.defer(function() {
                        l(), u = null
                    }))
                };
                t.on("keydown", function(e) {
                    var t = e.keyCode;
                    91 === t || t > 15 && 19 > t || t >= 37 && 40 >= t || d()
                }), o.hasEvent("paste") && t.on("paste cut", d)
            }
            t.on("change", l), i.$render = function() {
                t.val(i.$isEmpty(i.$viewValue) ? "" : i.$viewValue)
            };
            var p, h, g = n.ngPattern;
            if (g) {
                var m = function(e, t) {
                    return ir(i, "pattern", i.$isEmpty(t) || e.test(t), t)
                };
                h = g.match(/^\/(.*)\/([gim]*)$/), h ? (g = new RegExp(h[1], h[2]), p = function(e) {
                    return m(g, e)
                }) : p = function(n) {
                    var i = e.$eval(g);
                    if (!i || !i.test) throw r("ngPattern")("noregexp", "Expected {0} to be a RegExp but was {1}. Element: {2}", g, i, V(t));
                    return m(i, n)
                }, i.$formatters.push(p), i.$parsers.push(p)
            }
            if (n.ngMinlength) {
                var v = f(n.ngMinlength),
                    y = function(e) {
                        return ir(i, "minlength", i.$isEmpty(e) || e.length >= v, e)
                    };
                i.$parsers.push(y), i.$formatters.push(y)
            }
            if (n.ngMaxlength) {
                var b = f(n.ngMaxlength),
                    $ = function(e) {
                        return ir(i, "maxlength", i.$isEmpty(e) || e.length <= b, e)
                    };
                i.$parsers.push($), i.$formatters.push($)
            }
        }

        function sr(e, t, r, i, o, a) {
            if (ar(e, t, r, i, o, a), i.$parsers.push(function(e) {
                var t = i.$isEmpty(e);
                return t || Mi.test(e) ? (i.$setValidity("number", !0), "" === e ? null : t ? e : parseFloat(e)) : (i.$setValidity("number", !1), n)
            }), or(i, "number", t), i.$formatters.push(function(e) {
                return i.$isEmpty(e) ? "" : "" + e
            }), r.min) {
                var s = function(e) {
                    var t = parseFloat(r.min);
                    return ir(i, "min", i.$isEmpty(e) || e >= t, e)
                };
                i.$parsers.push(s), i.$formatters.push(s)
            }
            if (r.max) {
                var c = function(e) {
                    var t = parseFloat(r.max);
                    return ir(i, "max", i.$isEmpty(e) || t >= e, e)
                };
                i.$parsers.push(c), i.$formatters.push(c)
            }
            i.$formatters.push(function(e) {
                return ir(i, "number", i.$isEmpty(e) || w(e), e)
            })
        }

        function cr(e, t, n, r, i, o) {
            ar(e, t, n, r, i, o);
            var a = function(e) {
                return ir(r, "url", r.$isEmpty(e) || _i.test(e), e)
            };
            r.$formatters.push(a), r.$parsers.push(a)
        }

        function lr(e, t, n, r, i, o) {
            ar(e, t, n, r, i, o);
            var a = function(e) {
                return ir(r, "email", r.$isEmpty(e) || qi.test(e), e)
            };
            r.$formatters.push(a), r.$parsers.push(a)
        }

        function ur(e, t, n, r) {
            v(n.name) && t.attr("name", l()), t.on("click", function() {
                t[0].checked && e.$apply(function() {
                    r.$setViewValue(n.value)
                })
            }), r.$render = function() {
                var e = n.value;
                t[0].checked = e == r.$viewValue
            }, n.$observe("value", r.$render)
        }

        function dr(e, t, n, r) {
            var i = n.ngTrueValue,
                o = n.ngFalseValue;
            $(i) || (i = !0), $(o) || (o = !1), t.on("click", function() {
                e.$apply(function() {
                    r.$setViewValue(t[0].checked)
                })
            }), r.$render = function() {
                t[0].checked = r.$viewValue
            }, r.$isEmpty = function(e) {
                return e !== i
            }, r.$formatters.push(function(e) {
                return e === i
            }), r.$parsers.push(function(e) {
                return e ? i : o
            })
        }

        function fr(e, t) {
            return e = "ngClass" + e, ["$animate",
                function(n) {
                    function r(e, t) {
                        var n = [];
                        e: for (var r = 0; r < e.length; r++) {
                            for (var i = e[r], o = 0; o < t.length; o++)
                                if (i == t[o]) continue e;
                            n.push(i)
                        }
                        return n
                    }

                    function i(e) {
                        if (x(e)) return e;
                        if ($(e)) return e.split(" ");
                        if (b(e)) {
                            var t = [];
                            return o(e, function(e, n) {
                                e && t.push(n)
                            }), t
                        }
                        return e
                    }
                    return {
                        restrict: "AC",
                        link: function(a, s, c) {
                            function l(e) {
                                var t = d(e, 1);
                                c.$addClass(t)
                            }

                            function u(e) {
                                var t = d(e, -1);
                                c.$removeClass(t)
                            }

                            function d(e, t) {
                                var n = s.data("$classCounts") || {}, r = [];
                                return o(e, function(e) {
                                    (t > 0 || n[e]) && (n[e] = (n[e] || 0) + t, n[e] === +(t > 0) && r.push(e))
                                }), s.data("$classCounts", n), r.join(" ")
                            }

                            function f(e, t) {
                                var i = r(t, e),
                                    o = r(e, t);
                                o = d(o, -1), i = d(i, 1), 0 === i.length ? n.removeClass(s, o) : 0 === o.length ? n.addClass(s, i) : n.setClass(s, i, o)
                            }

                            function p(e) {
                                if (t === !0 || a.$index % 2 === t) {
                                    var n = i(e || []);
                                    if (h) {
                                        if (!L(e, h)) {
                                            var r = i(h);
                                            f(r, n)
                                        }
                                    } else l(n)
                                }
                                h = I(e)
                            }
                            var h;
                            a.$watch(c[e], p, !0), c.$observe("class", function() {
                                p(a.$eval(c[e]))
                            }), "ngClass" !== e && a.$watch("$index", function(n, r) {
                                var o = 1 & n;
                                if (o !== r & 1) {
                                    var s = i(a.$eval(c[e]));
                                    o === t ? l(s) : u(s)
                                }
                            })
                        }
                    }
                }
            ]
        }
        var pr = function(e) {
                return $(e) ? e.toLowerCase() : e
            }, hr = Object.prototype.hasOwnProperty,
            gr = function(e) {
                return $(e) ? e.toUpperCase() : e
            }, mr = function(e) {
                return $(e) ? e.replace(/[A-Z]/g, function(e) {
                    return String.fromCharCode(32 | e.charCodeAt(0))
                }) : e
            }, vr = function(e) {
                return $(e) ? e.replace(/[a-z]/g, function(e) {
                    return String.fromCharCode(-33 & e.charCodeAt(0))
                }) : e
            };
        "i" !== "I".toLowerCase() && (pr = mr, gr = vr);
        var yr, br, $r, wr, kr, xr = [].slice,
            Tr = [].push,
            Cr = Object.prototype.toString,
            Sr = r("ng"),
            Ar = (e.angular, e.angular || (e.angular = {})),
            Er = ["0", "0", "0"];
        yr = f((/msie (\d+)/.exec(pr(navigator.userAgent)) || [])[1]), isNaN(yr) && (yr = f((/trident\/.*; rv:(\d+)/.exec(pr(navigator.userAgent)) || [])[1])), h.$inject = [], g.$inject = [];
        var Nr = function() {
            return String.prototype.trim ? function(e) {
                return $(e) ? e.trim() : e
            } : function(e) {
                return $(e) ? e.replace(/^\s\s*/, "").replace(/\s\s*$/, "") : e
            }
        }();
        kr = 9 > yr ? function(e) {
            return e = e.nodeName ? e : e[0], e.scopeName && "HTML" != e.scopeName ? gr(e.scopeName + ":" + e.nodeName) : e.nodeName
        } : function(e) {
            return e.nodeName ? e.nodeName : e[0].nodeName
        };
        var jr = /[A-Z]/g,
            _r = {
                full: "1.2.16",
                major: 1,
                minor: 2,
                dot: 16,
                codeName: "badger-enumeration"
            }, qr = gt.cache = {}, Mr = gt.expando = "ng-" + (new Date).getTime(),
            Or = 1,
            Ir = e.document.addEventListener ? function(e, t, n) {
                e.addEventListener(t, n, !1)
            } : function(e, t, n) {
                e.attachEvent("on" + t, n)
            }, Dr = e.document.removeEventListener ? function(e, t, n) {
                e.removeEventListener(t, n, !1)
            } : function(e, t, n) {
                e.detachEvent("on" + t, n)
            }, Lr = (gt._data = function(e) {
                return this.cache[e[this.expando]] || {}
            }, /([\:\-\_]+(.))/g),
            Pr = /^moz([A-Z])/,
            Fr = r("jqLite"),
            Rr = /^<(\w+)\s*\/?>(?:<\/\1>|)$/,
            zr = /<|&#?\w+;/,
            Hr = /<([\w:]+)/,
            Br = /<(?!area|br|col|embed|hr|img|input|link|meta|param)(([\w:]+)[^>]*)\/>/gi,
            Ur = {
                option: [1, '<select multiple="multiple">', "</select>"],
                thead: [1, "<table>", "</table>"],
                col: [2, "<table><colgroup>", "</colgroup></table>"],
                tr: [2, "<table><tbody>", "</tbody></table>"],
                td: [3, "<table><tbody><tr>", "</tr></tbody></table>"],
                _default: [0, "", ""]
            };
        Ur.optgroup = Ur.option, Ur.tbody = Ur.tfoot = Ur.colgroup = Ur.caption = Ur.thead, Ur.th = Ur.td;
        var Wr = gt.prototype = {
            ready: function(n) {
                function r() {
                    i || (i = !0, n())
                }
                var i = !1;
                "complete" === t.readyState ? setTimeout(r) : (this.on("DOMContentLoaded", r), gt(e).on("load", r))
            },
            toString: function() {
                var e = [];
                return o(this, function(t) {
                    e.push("" + t)
                }), "[" + e.join(", ") + "]"
            },
            eq: function(e) {
                return br(e >= 0 ? this[e] : this[this.length + e])
            },
            length: 0,
            push: Tr,
            sort: [].sort,
            splice: [].splice
        }, Vr = {};
        o("multiple,selected,checked,disabled,readOnly,required,open".split(","), function(e) {
            Vr[pr(e)] = e
        });
        var Jr = {};
        o("input,select,option,textarea,button,form,details".split(","), function(e) {
            Jr[gr(e)] = !0
        }), o({
            data: wt,
            inheritedData: At,
            scope: function(e) {
                return br(e).data("$scope") || At(e.parentNode || e, ["$isolateScope", "$scope"])
            },
            isolateScope: function(e) {
                return br(e).data("$isolateScope") || br(e).data("$isolateScopeNoTemplate")
            },
            controller: St,
            injector: function(e) {
                return At(e, "$injector")
            },
            removeAttr: function(e, t) {
                e.removeAttribute(t)
            },
            hasClass: kt,
            css: function(e, t, r) {
                if (t = ut(t), !y(r)) {
                    var i;
                    return 8 >= yr && (i = e.currentStyle && e.currentStyle[t], "" === i && (i = "auto")), i = i || e.style[t], 8 >= yr && (i = "" === i ? n : i), i
                }
                e.style[t] = r
            },
            attr: function(e, t, r) {
                var i = pr(t);
                if (Vr[i]) {
                    if (!y(r)) return e[t] || (e.attributes.getNamedItem(t) || h).specified ? i : n;
                    r ? (e[t] = !0, e.setAttribute(t, i)) : (e[t] = !1, e.removeAttribute(i))
                } else if (y(r)) e.setAttribute(t, r);
                else if (e.getAttribute) {
                    var o = e.getAttribute(t, 2);
                    return null === o ? n : o
                }
            },
            prop: function(e, t, n) {
                return y(n) ? void(e[t] = n) : e[t]
            },
            text: function() {
                function e(e, n) {
                    var r = t[e.nodeType];
                    return v(n) ? r ? e[r] : "" : void(e[r] = n)
                }
                var t = [];
                return 9 > yr ? (t[1] = "innerText", t[3] = "nodeValue") : t[1] = t[3] = "textContent", e.$dv = "", e
            }(),
            val: function(e, t) {
                if (v(t)) {
                    if ("SELECT" === kr(e) && e.multiple) {
                        var n = [];
                        return o(e.options, function(e) {
                            e.selected && n.push(e.value || e.text)
                        }), 0 === n.length ? null : n
                    }
                    return e.value
                }
                e.value = t
            },
            html: function(e, t) {
                if (v(t)) return e.innerHTML;
                for (var n = 0, r = e.childNodes; n < r.length; n++) vt(r[n]);
                e.innerHTML = t
            },
            empty: Et
        }, function(e, t) {
            gt.prototype[t] = function(t, r) {
                var i, o;
                if (e !== Et && (2 == e.length && e !== kt && e !== St ? t : r) === n) {
                    if (b(t)) {
                        for (i = 0; i < this.length; i++)
                            if (e === wt) e(this[i], t);
                            else
                                for (o in t) e(this[i], o, t[o]);
                        return this
                    }
                    for (var a = e.$dv, s = a === n ? Math.min(this.length, 1) : this.length, c = 0; s > c; c++) {
                        var l = e(this[c], t, r);
                        a = a ? a + l : l
                    }
                    return a
                }
                for (i = 0; i < this.length; i++) e(this[i], t, r);
                return this
            }
        }), o({
            removeData: bt,
            dealoc: vt,
            on: function xo(e, n, r, i) {
                if (y(i)) throw Fr("onargs", "jqLite#on() does not support the `selector` or `eventData` parameters");
                var a = $t(e, "events"),
                    s = $t(e, "handle");
                a || $t(e, "events", a = {}), s || $t(e, "handle", s = jt(e, a)), o(n.split(" "), function(n) {
                    var i = a[n];
                    if (!i) {
                        if ("mouseenter" == n || "mouseleave" == n) {
                            var o = t.body.contains || t.body.compareDocumentPosition ? function(e, t) {
                                var n = 9 === e.nodeType ? e.documentElement : e,
                                    r = t && t.parentNode;
                                return e === r || !(!r || 1 !== r.nodeType || !(n.contains ? n.contains(r) : e.compareDocumentPosition && 16 & e.compareDocumentPosition(r)))
                            } : function(e, t) {
                                if (t)
                                    for (; t = t.parentNode;)
                                        if (t === e) return !0;
                                return !1
                            };
                            a[n] = [];
                            var c = {
                                mouseleave: "mouseout",
                                mouseenter: "mouseover"
                            };
                            xo(e, c[n], function(e) {
                                var t = this,
                                    r = e.relatedTarget;
                                (!r || r !== t && !o(t, r)) && s(e, n)
                            })
                        } else Ir(e, n, s), a[n] = [];
                        i = a[n]
                    }
                    i.push(r)
                })
            },
            off: yt,
            one: function(e, t, n) {
                e = br(e), e.on(t, function r() {
                    e.off(t, n), e.off(t, r)
                }), e.on(t, n)
            },
            replaceWith: function(e, t) {
                var n, r = e.parentNode;
                vt(e), o(new gt(t), function(t) {
                    n ? r.insertBefore(t, n.nextSibling) : r.replaceChild(t, e), n = t
                })
            },
            children: function(e) {
                var t = [];
                return o(e.childNodes, function(e) {
                    1 === e.nodeType && t.push(e)
                }), t
            },
            contents: function(e) {
                return e.contentDocument || e.childNodes || []
            },
            append: function(e, t) {
                o(new gt(t), function(t) {
                    (1 === e.nodeType || 11 === e.nodeType) && e.appendChild(t)
                })
            },
            prepend: function(e, t) {
                if (1 === e.nodeType) {
                    var n = e.firstChild;
                    o(new gt(t), function(t) {
                        e.insertBefore(t, n)
                    })
                }
            },
            wrap: function(e, t) {
                t = br(t)[0];
                var n = e.parentNode;
                n && n.replaceChild(t, e), t.appendChild(e)
            },
            remove: function(e) {
                vt(e);
                var t = e.parentNode;
                t && t.removeChild(e)
            },
            after: function(e, t) {
                var n = e,
                    r = e.parentNode;
                o(new gt(t), function(e) {
                    r.insertBefore(e, n.nextSibling), n = e
                })
            },
            addClass: Tt,
            removeClass: xt,
            toggleClass: function(e, t, n) {
                t && o(t.split(" "), function(t) {
                    var r = n;
                    v(r) && (r = !kt(e, t)), (r ? Tt : xt)(e, t)
                })
            },
            parent: function(e) {
                var t = e.parentNode;
                return t && 11 !== t.nodeType ? t : null
            },
            next: function(e) {
                if (e.nextElementSibling) return e.nextElementSibling;
                for (var t = e.nextSibling; null != t && 1 !== t.nodeType;) t = t.nextSibling;
                return t
            },
            find: function(e, t) {
                return e.getElementsByTagName ? e.getElementsByTagName(t) : []
            },
            clone: mt,
            triggerHandler: function(e, t, n) {
                var r = ($t(e, "events") || {})[t];
                n = n || [];
                var i = [{
                    preventDefault: h,
                    stopPropagation: h
                }];
                o(r, function(t) {
                    t.apply(e, i.concat(n))
                })
            }
        }, function(e, t) {
            gt.prototype[t] = function(t, n, r) {
                for (var i, o = 0; o < this.length; o++) v(i) ? (i = e(this[o], t, n, r), y(i) && (i = br(i))) : Ct(i, e(this[o], t, n, r));
                return y(i) ? i : this
            }, gt.prototype.bind = gt.prototype.on, gt.prototype.unbind = gt.prototype.off
        }), qt.prototype = {
            put: function(e, t) {
                this[_t(e)] = t
            },
            get: function(e) {
                return this[_t(e)]
            },
            remove: function(e) {
                var t = this[e = _t(e)];
                return delete this[e], t
            }
        };
        var Xr = /^function\s*[^\(]*\(\s*([^\)]*)\)/m,
            Gr = /,/,
            Kr = /^\s*(_?)(\S+?)\1\s*$/,
            Qr = /((\/\/.*$)|(\/\*[\s\S]*?\*\/))/gm,
            Yr = r("$injector"),
            Zr = r("$animate"),
            ei = ["$provide",
                function(e) {
                    this.$$selectors = {}, this.register = function(t, n) {
                        var r = t + "-animation";
                        if (t && "." != t.charAt(0)) throw Zr("notcsel", "Expecting class selector starting with '.' got '{0}'.", t);
                        this.$$selectors[t.substr(1)] = r, e.factory(r, n)
                    }, this.classNameFilter = function(e) {
                        return 1 === arguments.length && (this.$$classNameFilter = e instanceof RegExp ? e : null), this.$$classNameFilter
                    }, this.$get = ["$timeout", "$$asyncCallback",
                        function(e, t) {
                            function n(e) {
                                e && t(e)
                            }
                            return {
                                enter: function(e, t, r, i) {
                                    r ? r.after(e) : (t && t[0] || (t = r.parent()), t.append(e)), n(i)
                                },
                                leave: function(e, t) {
                                    e.remove(), n(t)
                                },
                                move: function(e, t, n, r) {
                                    this.enter(e, t, n, r)
                                },
                                addClass: function(e, t, r) {
                                    t = $(t) ? t : x(t) ? t.join(" ") : "", o(e, function(e) {
                                        Tt(e, t)
                                    }), n(r)
                                },
                                removeClass: function(e, t, r) {
                                    t = $(t) ? t : x(t) ? t.join(" ") : "", o(e, function(e) {
                                        xt(e, t)
                                    }), n(r)
                                },
                                setClass: function(e, t, r, i) {
                                    o(e, function(e) {
                                        Tt(e, t), xt(e, r)
                                    }), n(i)
                                },
                                enabled: h
                            }
                        }
                    ]
                }
            ],
            ti = r("$compile");
        zt.$inject = ["$provide", "$$sanitizeUriProvider"];
        var ni = /^(x[\:\-_]|data[\:\-_])/i,
            ri = r("$interpolate"),
            ii = /^([^\?#]*)(\?([^#]*))?(#(.*))?$/,
            oi = {
                http: 80,
                https: 443,
                ftp: 21
            }, ai = r("$location");
        hn.prototype = pn.prototype = fn.prototype = {
            $$html5: !1,
            $$replace: !1,
            absUrl: gn("$$absUrl"),
            url: function(e, t) {
                if (v(e)) return this.$$url;
                var n = ii.exec(e);
                return n[1] && this.path(decodeURIComponent(n[1])), (n[2] || n[1]) && this.search(n[3] || ""), this.hash(n[5] || "", t), this
            },
            protocol: gn("$$protocol"),
            host: gn("$$host"),
            port: gn("$$port"),
            path: mn("$$path", function(e) {
                return "/" == e.charAt(0) ? e : "/" + e
            }),
            search: function(e, t) {
                switch (arguments.length) {
                    case 0:
                        return this.$$search;
                    case 1:
                        if ($(e)) this.$$search = X(e);
                        else {
                            if (!b(e)) throw ai("isrcharg", "The first argument of the `$location#search()` call must be a string or an object.");
                            this.$$search = e
                        }
                        break;
                    default:
                        v(t) || null === t ? delete this.$$search[e] : this.$$search[e] = t
                }
                return this.$$compose(), this
            },
            hash: mn("$$hash", g),
            replace: function() {
                return this.$$replace = !0, this
            }
        };
        var si, ci = r("$parse"),
            li = {}, ui = {
                "null": function() {
                    return null
                },
                "true": function() {
                    return !0
                },
                "false": function() {
                    return !1
                },
                undefined: h,
                "+": function(e, t, r, i) {
                    return r = r(e, t), i = i(e, t), y(r) ? y(i) ? r + i : r : y(i) ? i : n
                },
                "-": function(e, t, n, r) {
                    return n = n(e, t), r = r(e, t), (y(n) ? n : 0) - (y(r) ? r : 0)
                },
                "*": function(e, t, n, r) {
                    return n(e, t) * r(e, t)
                },
                "/": function(e, t, n, r) {
                    return n(e, t) / r(e, t)
                },
                "%": function(e, t, n, r) {
                    return n(e, t) % r(e, t)
                },
                "^": function(e, t, n, r) {
                    return n(e, t) ^ r(e, t)
                },
                "=": h,
                "===": function(e, t, n, r) {
                    return n(e, t) === r(e, t)
                },
                "!==": function(e, t, n, r) {
                    return n(e, t) !== r(e, t)
                },
                "==": function(e, t, n, r) {
                    return n(e, t) == r(e, t)
                },
                "!=": function(e, t, n, r) {
                    return n(e, t) != r(e, t)
                },
                "<": function(e, t, n, r) {
                    return n(e, t) < r(e, t)
                },
                ">": function(e, t, n, r) {
                    return n(e, t) > r(e, t)
                },
                "<=": function(e, t, n, r) {
                    return n(e, t) <= r(e, t)
                },
                ">=": function(e, t, n, r) {
                    return n(e, t) >= r(e, t)
                },
                "&&": function(e, t, n, r) {
                    return n(e, t) && r(e, t)
                },
                "||": function(e, t, n, r) {
                    return n(e, t) || r(e, t)
                },
                "&": function(e, t, n, r) {
                    return n(e, t) & r(e, t)
                },
                "|": function(e, t, n, r) {
                    return r(e, t)(e, t, n(e, t))
                },
                "!": function(e, t, n) {
                    return !n(e, t)
                }
            }, di = {
                n: "\n",
                f: "\f",
                r: "\r",
                t: "	",
                v: "",
                "'": "'",
                '"': '"'
            }, fi = function(e) {
                this.options = e
            };
        fi.prototype = {
            constructor: fi,
            lex: function(e) {
                this.text = e, this.index = 0, this.ch = n, this.lastCh = ":", this.tokens = [];
                for (var t, r = []; this.index < this.text.length;) {
                    if (this.ch = this.text.charAt(this.index), this.is("\"'")) this.readString(this.ch);
                    else if (this.isNumber(this.ch) || this.is(".") && this.isNumber(this.peek())) this.readNumber();
                    else if (this.isIdent(this.ch)) this.readIdent(), this.was("{,") && "{" === r[0] && (t = this.tokens[this.tokens.length - 1]) && (t.json = -1 === t.text.indexOf("."));
                    else if (this.is("(){}[].,;:?")) this.tokens.push({
                        index: this.index,
                        text: this.ch,
                        json: this.was(":[,") && this.is("{[") || this.is("}]:,")
                    }), this.is("{[") && r.unshift(this.ch), this.is("}]") && r.shift(), this.index++;
                    else {
                        if (this.isWhitespace(this.ch)) {
                            this.index++;
                            continue
                        }
                        var i = this.ch + this.peek(),
                            o = i + this.peek(2),
                            a = ui[this.ch],
                            s = ui[i],
                            c = ui[o];
                        c ? (this.tokens.push({
                            index: this.index,
                            text: o,
                            fn: c
                        }), this.index += 3) : s ? (this.tokens.push({
                            index: this.index,
                            text: i,
                            fn: s
                        }), this.index += 2) : a ? (this.tokens.push({
                            index: this.index,
                            text: this.ch,
                            fn: a,
                            json: this.was("[,:") && this.is("+-")
                        }), this.index += 1) : this.throwError("Unexpected next character ", this.index, this.index + 1)
                    }
                    this.lastCh = this.ch
                }
                return this.tokens
            },
            is: function(e) {
                return -1 !== e.indexOf(this.ch)
            },
            was: function(e) {
                return -1 !== e.indexOf(this.lastCh)
            },
            peek: function(e) {
                var t = e || 1;
                return this.index + t < this.text.length ? this.text.charAt(this.index + t) : !1
            },
            isNumber: function(e) {
                return e >= "0" && "9" >= e
            },
            isWhitespace: function(e) {
                return " " === e || "\r" === e || "	" === e || "\n" === e || "" === e || "Â " === e
            },
            isIdent: function(e) {
                return e >= "a" && "z" >= e || e >= "A" && "Z" >= e || "_" === e || "$" === e
            },
            isExpOperator: function(e) {
                return "-" === e || "+" === e || this.isNumber(e)
            },
            throwError: function(e, t, n) {
                n = n || this.index;
                var r = y(t) ? "s " + t + "-" + this.index + " [" + this.text.substring(t, n) + "]" : " " + n;
                throw ci("lexerr", "Lexer Error: {0} at column{1} in expression [{2}].", e, r, this.text)
            },
            readNumber: function() {
                for (var e = "", t = this.index; this.index < this.text.length;) {
                    var n = pr(this.text.charAt(this.index));
                    if ("." == n || this.isNumber(n)) e += n;
                    else {
                        var r = this.peek();
                        if ("e" == n && this.isExpOperator(r)) e += n;
                        else if (this.isExpOperator(n) && r && this.isNumber(r) && "e" == e.charAt(e.length - 1)) e += n;
                        else {
                            if (!this.isExpOperator(n) || r && this.isNumber(r) || "e" != e.charAt(e.length - 1)) break;
                            this.throwError("Invalid exponent")
                        }
                    }
                    this.index++
                }
                e = 1 * e, this.tokens.push({
                    index: t,
                    text: e,
                    json: !0,
                    fn: function() {
                        return e
                    }
                })
            },
            readIdent: function() {
                for (var e, t, n, r, i = this, o = "", a = this.index; this.index < this.text.length && (r = this.text.charAt(this.index), "." === r || this.isIdent(r) || this.isNumber(r));) "." === r && (e = this.index), o += r, this.index++;
                if (e)
                    for (t = this.index; t < this.text.length;) {
                        if (r = this.text.charAt(t), "(" === r) {
                            n = o.substr(e - a + 1), o = o.substr(0, e - a), this.index = t;
                            break
                        }
                        if (!this.isWhitespace(r)) break;
                        t++
                    }
                var s = {
                    index: a,
                    text: o
                };
                if (ui.hasOwnProperty(o)) s.fn = ui[o], s.json = ui[o];
                else {
                    var c = Cn(o, this.options, this.text);
                    s.fn = d(function(e, t) {
                        return c(e, t)
                    }, {
                        assign: function(e, t) {
                            return wn(e, o, t, i.text, i.options)
                        }
                    })
                }
                this.tokens.push(s), n && (this.tokens.push({
                    index: e,
                    text: ".",
                    json: !1
                }), this.tokens.push({
                    index: e + 1,
                    text: n,
                    json: !1
                }))
            },
            readString: function(e) {
                var t = this.index;
                this.index++;
                for (var n = "", r = e, i = !1; this.index < this.text.length;) {
                    var o = this.text.charAt(this.index);
                    if (r += o, i) {
                        if ("u" === o) {
                            var a = this.text.substring(this.index + 1, this.index + 5);
                            a.match(/[\da-f]{4}/i) || this.throwError("Invalid unicode escape [\\u" + a + "]"), this.index += 4, n += String.fromCharCode(parseInt(a, 16))
                        } else {
                            var s = di[o];
                            n += s ? s : o
                        }
                        i = !1
                    } else if ("\\" === o) i = !0;
                    else {
                        if (o === e) return this.index++, void this.tokens.push({
                            index: t,
                            text: r,
                            string: n,
                            json: !0,
                            fn: function() {
                                return n
                            }
                        });
                        n += o
                    }
                    this.index++
                }
                this.throwError("Unterminated quote", t)
            }
        };
        var pi = function(e, t, n) {
            this.lexer = e, this.$filter = t, this.options = n
        };
        pi.ZERO = d(function() {
            return 0
        }, {
            constant: !0
        }), pi.prototype = {
            constructor: pi,
            parse: function(e, t) {
                this.text = e, this.json = t, this.tokens = this.lexer.lex(e), t && (this.assignment = this.logicalOR, this.functionCall = this.fieldAccess = this.objectIndex = this.filterChain = function() {
                    this.throwError("is not valid json", {
                        text: e,
                        index: 0
                    })
                });
                var n = t ? this.primary() : this.statements();
                return 0 !== this.tokens.length && this.throwError("is an unexpected token", this.tokens[0]), n.literal = !! n.literal, n.constant = !! n.constant, n
            },
            primary: function() {
                var e;
                if (this.expect("(")) e = this.filterChain(), this.consume(")");
                else if (this.expect("[")) e = this.arrayDeclaration();
                else if (this.expect("{")) e = this.object();
                else {
                    var t = this.expect();
                    e = t.fn, e || this.throwError("not a primary expression", t), t.json && (e.constant = !0, e.literal = !0)
                }
                for (var n, r; n = this.expect("(", "[", ".");) "(" === n.text ? (e = this.functionCall(e, r), r = null) : "[" === n.text ? (r = e, e = this.objectIndex(e)) : "." === n.text ? (r = e, e = this.fieldAccess(e)) : this.throwError("IMPOSSIBLE");
                return e
            },
            throwError: function(e, t) {
                throw ci("syntax", "Syntax Error: Token '{0}' {1} at column {2} of the expression [{3}] starting at [{4}].", t.text, e, t.index + 1, this.text, this.text.substring(t.index))
            },
            peekToken: function() {
                if (0 === this.tokens.length) throw ci("ueoe", "Unexpected end of expression: {0}", this.text);
                return this.tokens[0]
            },
            peek: function(e, t, n, r) {
                if (this.tokens.length > 0) {
                    var i = this.tokens[0],
                        o = i.text;
                    if (o === e || o === t || o === n || o === r || !e && !t && !n && !r) return i
                }
                return !1
            },
            expect: function(e, t, n, r) {
                var i = this.peek(e, t, n, r);
                return i ? (this.json && !i.json && this.throwError("is not valid json", i), this.tokens.shift(), i) : !1
            },
            consume: function(e) {
                this.expect(e) || this.throwError("is unexpected, expecting [" + e + "]", this.peek())
            },
            unaryFn: function(e, t) {
                return d(function(n, r) {
                    return e(n, r, t)
                }, {
                    constant: t.constant
                })
            },
            ternaryFn: function(e, t, n) {
                return d(function(r, i) {
                    return e(r, i) ? t(r, i) : n(r, i)
                }, {
                    constant: e.constant && t.constant && n.constant
                })
            },
            binaryFn: function(e, t, n) {
                return d(function(r, i) {
                    return t(r, i, e, n)
                }, {
                    constant: e.constant && n.constant
                })
            },
            statements: function() {
                for (var e = [];;)
                    if (this.tokens.length > 0 && !this.peek("}", ")", ";", "]") && e.push(this.filterChain()), !this.expect(";")) return 1 === e.length ? e[0] : function(t, n) {
                        for (var r, i = 0; i < e.length; i++) {
                            var o = e[i];
                            o && (r = o(t, n))
                        }
                        return r
                    }
            },
            filterChain: function() {
                for (var e, t = this.expression();;) {
                    if (!(e = this.expect("|"))) return t;
                    t = this.binaryFn(t, e.fn, this.filter())
                }
            },
            filter: function() {
                for (var e = this.expect(), t = this.$filter(e.text), n = [];;) {
                    if (!(e = this.expect(":"))) {
                        var r = function(e, r, i) {
                            for (var o = [i], a = 0; a < n.length; a++) o.push(n[a](e, r));
                            return t.apply(e, o)
                        };
                        return function() {
                            return r
                        }
                    }
                    n.push(this.expression())
                }
            },
            expression: function() {
                return this.assignment()
            },
            assignment: function() {
                var e, t, n = this.ternary();
                return (t = this.expect("=")) ? (n.assign || this.throwError("implies assignment but [" + this.text.substring(0, t.index) + "] can not be assigned to", t), e = this.ternary(), function(t, r) {
                    return n.assign(t, e(t, r), r)
                }) : n
            },
            ternary: function() {
                var e, t, n = this.logicalOR();
                return (t = this.expect("?")) ? (e = this.ternary(), (t = this.expect(":")) ? this.ternaryFn(n, e, this.ternary()) : void this.throwError("expected :", t)) : n
            },
            logicalOR: function() {
                for (var e, t = this.logicalAND();;) {
                    if (!(e = this.expect("||"))) return t;
                    t = this.binaryFn(t, e.fn, this.logicalAND())
                }
            },
            logicalAND: function() {
                var e, t = this.equality();
                return (e = this.expect("&&")) && (t = this.binaryFn(t, e.fn, this.logicalAND())), t
            },
            equality: function() {
                var e, t = this.relational();
                return (e = this.expect("==", "!=", "===", "!==")) && (t = this.binaryFn(t, e.fn, this.equality())), t
            },
            relational: function() {
                var e, t = this.additive();
                return (e = this.expect("<", ">", "<=", ">=")) && (t = this.binaryFn(t, e.fn, this.relational())), t
            },
            additive: function() {
                for (var e, t = this.multiplicative(); e = this.expect("+", "-");) t = this.binaryFn(t, e.fn, this.multiplicative());
                return t
            },
            multiplicative: function() {
                for (var e, t = this.unary(); e = this.expect("*", "/", "%");) t = this.binaryFn(t, e.fn, this.unary());
                return t
            },
            unary: function() {
                var e;
                return this.expect("+") ? this.primary() : (e = this.expect("-")) ? this.binaryFn(pi.ZERO, e.fn, this.unary()) : (e = this.expect("!")) ? this.unaryFn(e.fn, this.unary()) : this.primary()
            },
            fieldAccess: function(e) {
                var t = this,
                    n = this.expect().text,
                    r = Cn(n, this.options, this.text);
                return d(function(t, n, i) {
                    return r(i || e(t, n))
                }, {
                    assign: function(r, i, o) {
                        return wn(e(r, o), n, i, t.text, t.options)
                    }
                })
            },
            objectIndex: function(e) {
                var t = this,
                    r = this.expression();
                return this.consume("]"), d(function(i, o) {
                    var a, s, c = e(i, o),
                        l = r(i, o);
                    return c ? (a = $n(c[l], t.text), a && a.then && t.options.unwrapPromises && (s = a, "$$v" in a || (s.$$v = n, s.then(function(e) {
                        s.$$v = e
                    })), a = a.$$v), a) : n
                }, {
                    assign: function(n, i, o) {
                        var a = r(n, o),
                            s = $n(e(n, o), t.text);
                        return s[a] = i
                    }
                })
            },
            functionCall: function(e, t) {
                var n = [];
                if (")" !== this.peekToken().text)
                    do n.push(this.expression()); while (this.expect(","));
                this.consume(")");
                var r = this;
                return function(i, o) {
                    for (var a = [], s = t ? t(i, o) : i, c = 0; c < n.length; c++) a.push(n[c](i, o));
                    var l = e(i, o, s) || h;
                    $n(s, r.text), $n(l, r.text);
                    var u = l.apply ? l.apply(s, a) : l(a[0], a[1], a[2], a[3], a[4]);
                    return $n(u, r.text)
                }
            },
            arrayDeclaration: function() {
                var e = [],
                    t = !0;
                if ("]" !== this.peekToken().text)
                    do {
                        if (this.peek("]")) break;
                        var n = this.expression();
                        e.push(n), n.constant || (t = !1)
                    } while (this.expect(","));
                return this.consume("]"), d(function(t, n) {
                    for (var r = [], i = 0; i < e.length; i++) r.push(e[i](t, n));
                    return r
                }, {
                    literal: !0,
                    constant: t
                })
            },
            object: function() {
                var e = [],
                    t = !0;
                if ("}" !== this.peekToken().text)
                    do {
                        if (this.peek("}")) break;
                        var n = this.expect(),
                            r = n.string || n.text;
                        this.consume(":");
                        var i = this.expression();
                        e.push({
                            key: r,
                            value: i
                        }), i.constant || (t = !1)
                    } while (this.expect(","));
                return this.consume("}"), d(function(t, n) {
                    for (var r = {}, i = 0; i < e.length; i++) {
                        var o = e[i];
                        r[o.key] = o.value(t, n)
                    }
                    return r
                }, {
                    literal: !0,
                    constant: t
                })
            }
        };
        var hi = {}, gi = r("$sce"),
            mi = {
                HTML: "html",
                CSS: "css",
                URL: "url",
                RESOURCE_URL: "resourceUrl",
                JS: "js"
            }, vi = t.createElement("a"),
            yi = Fn(e.location.href, !0);
        Hn.$inject = ["$provide"], Un.$inject = ["$locale"], Wn.$inject = ["$locale"];
        var bi = ".",
            $i = {
                yyyy: Xn("FullYear", 4),
                yy: Xn("FullYear", 2, 0, !0),
                y: Xn("FullYear", 1),
                MMMM: Gn("Month"),
                MMM: Gn("Month", !0),
                MM: Xn("Month", 2, 1),
                M: Xn("Month", 1, 1),
                dd: Xn("Date", 2),
                d: Xn("Date", 1),
                HH: Xn("Hours", 2),
                H: Xn("Hours", 1),
                hh: Xn("Hours", 2, -12),
                h: Xn("Hours", 1, -12),
                mm: Xn("Minutes", 2),
                m: Xn("Minutes", 1),
                ss: Xn("Seconds", 2),
                s: Xn("Seconds", 1),
                sss: Xn("Milliseconds", 3),
                EEEE: Gn("Day"),
                EEE: Gn("Day", !0),
                a: Qn,
                Z: Kn
            }, wi = /((?:[^yMdHhmsaZE']+)|(?:'(?:[^']|'')*')|(?:E+|y+|M+|d+|H+|h+|m+|s+|a|Z))(.*)/,
            ki = /^\-?\d+$/;
        Yn.$inject = ["$locale"];
        var xi = m(pr),
            Ti = m(gr);
        tr.$inject = ["$parse"];
        var Ci = m({
                restrict: "E",
                compile: function(e, n) {
                    return 8 >= yr && (n.href || n.name || n.$set("href", ""), e.append(t.createComment("IE fix"))), n.href || n.xlinkHref || n.name ? void 0 : function(e, t) {
                        var n = "[object SVGAnimatedString]" === Cr.call(t.prop("href")) ? "xlink:href" : "href";
                        t.on("click", function(e) {
                            t.attr(n) || e.preventDefault()
                        })
                    }
                }
            }),
            Si = {};
        o(Vr, function(e, t) {
            if ("multiple" != e) {
                var n = Ht("ng-" + t);
                Si[n] = function() {
                    return {
                        priority: 100,
                        link: function(e, r, i) {
                            e.$watch(i[n], function(e) {
                                i.$set(t, !! e)
                            })
                        }
                    }
                }
            }
        }), o(["src", "srcset", "href"], function(e) {
            var t = Ht("ng-" + e);
            Si[t] = function() {
                return {
                    priority: 99,
                    link: function(n, r, i) {
                        var o = e,
                            a = e;
                        "href" === e && "[object SVGAnimatedString]" === Cr.call(r.prop("href")) && (a = "xlinkHref", i.$attr[a] = "xlink:href", o = null), i.$observe(t, function(e) {
                            e && (i.$set(a, e), yr && o && r.prop(o, i[a]))
                        })
                    }
                }
            }
        });
        var Ai = {
            $addControl: h,
            $removeControl: h,
            $setValidity: h,
            $setDirty: h,
            $setPristine: h
        };
        rr.$inject = ["$element", "$attrs", "$scope", "$animate"];
        var Ei = function(e) {
                return ["$timeout", function(t) {
                    var r = {
                        name: "form",
                        restrict: e ? "EAC" : "E",
                        controller: rr,
                        compile: function() {
                            return {
                                pre: function(e, r, i, o) {
                                    if (!i.action) {
                                        var a = function(e) {
                                            e.preventDefault ? e.preventDefault() : e.returnValue = !1
                                        };
                                        Ir(r[0], "submit", a), r.on("$destroy", function() {
                                            t(function() {
                                                Dr(r[0], "submit", a)
                                            }, 0, !1)
                                        })
                                    }
                                    var s = r.parent().controller("form"),
                                        c = i.name || i.ngForm;
                                    c && wn(e, c, o, c), s && r.on("$destroy", function() {
                                        s.$removeControl(o), c && wn(e, c, n, c), d(o, Ai)
                                    })
                                }
                            }
                        }
                    };
                    return r
                }]
            }, Ni = Ei(),
            ji = Ei(!0),
            _i = /^(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?$/,
            qi = /^[a-z0-9!#$%&'*+/=?^_`{|}~.-]+@[a-z0-9-]+(\.[a-z0-9-]+)*$/i,
            Mi = /^\s*(\-|\+)?(\d+|(\d*(\.\d*)))\s*$/,
            Oi = {
                text: ar,
                number: sr,
                url: cr,
                email: lr,
                radio: ur,
                checkbox: dr,
                hidden: h,
                button: h,
                submit: h,
                reset: h,
                file: h
            }, Ii = ["$browser", "$sniffer",
                function(e, t) {
                    return {
                        restrict: "E",
                        require: "?ngModel",
                        link: function(n, r, i, o) {
                            o && (Oi[pr(i.type)] || Oi.text)(n, r, i, o, t, e)
                        }
                    }
                }
            ],
            Di = "ng-valid",
            Li = "ng-invalid",
            Pi = "ng-pristine",
            Fi = "ng-dirty",
            Ri = ["$scope", "$exceptionHandler", "$attrs", "$element", "$parse", "$animate",
                function(e, t, n, i, a, s) {
                    function c(e, t) {
                        t = t ? "-" + et(t, "-") : "", s.removeClass(i, (e ? Li : Di) + t), s.addClass(i, (e ? Di : Li) + t)
                    }
                    this.$viewValue = Number.NaN, this.$modelValue = Number.NaN, this.$parsers = [], this.$formatters = [], this.$viewChangeListeners = [], this.$pristine = !0, this.$dirty = !1, this.$valid = !0, this.$invalid = !1, this.$name = n.name;
                    var l = a(n.ngModel),
                        u = l.assign;
                    if (!u) throw r("ngModel")("nonassign", "Expression '{0}' is non-assignable. Element: {1}", n.ngModel, V(i));
                    this.$render = h, this.$isEmpty = function(e) {
                        return v(e) || "" === e || null === e || e !== e
                    };
                    var d = i.inheritedData("$formController") || Ai,
                        f = 0,
                        p = this.$error = {};
                    i.addClass(Pi), c(!0), this.$setValidity = function(e, t) {
                        p[e] !== !t && (t ? (p[e] && f--, f || (c(!0), this.$valid = !0, this.$invalid = !1)) : (c(!1), this.$invalid = !0, this.$valid = !1, f++), p[e] = !t, c(t, e), d.$setValidity(e, t, this))
                    }, this.$setPristine = function() {
                        this.$dirty = !1, this.$pristine = !0, s.removeClass(i, Fi), s.addClass(i, Pi)
                    }, this.$setViewValue = function(n) {
                        this.$viewValue = n, this.$pristine && (this.$dirty = !0, this.$pristine = !1, s.removeClass(i, Pi), s.addClass(i, Fi), d.$setDirty()), o(this.$parsers, function(e) {
                            n = e(n)
                        }), this.$modelValue !== n && (this.$modelValue = n, u(e, n), o(this.$viewChangeListeners, function(e) {
                            try {
                                e()
                            } catch (n) {
                                t(n)
                            }
                        }))
                    };
                    var g = this;
                    e.$watch(function() {
                        var t = l(e);
                        if (g.$modelValue !== t) {
                            var n = g.$formatters,
                                r = n.length;
                            for (g.$modelValue = t; r--;) t = n[r](t);
                            g.$viewValue !== t && (g.$viewValue = t, g.$render())
                        }
                        return t
                    })
                }
            ],
            zi = function() {
                return {
                    require: ["ngModel", "^?form"],
                    controller: Ri,
                    link: function(e, t, n, r) {
                        var i = r[0],
                            o = r[1] || Ai;
                        o.$addControl(i), e.$on("$destroy", function() {
                            o.$removeControl(i)
                        })
                    }
                }
            }, Hi = m({
                require: "ngModel",
                link: function(e, t, n, r) {
                    r.$viewChangeListeners.push(function() {
                        e.$eval(n.ngChange)
                    })
                }
            }),
            Bi = function() {
                return {
                    require: "?ngModel",
                    link: function(e, t, n, r) {
                        if (r) {
                            n.required = !0;
                            var i = function(e) {
                                return n.required && r.$isEmpty(e) ? void r.$setValidity("required", !1) : (r.$setValidity("required", !0), e)
                            };
                            r.$formatters.push(i), r.$parsers.unshift(i), n.$observe("required", function() {
                                i(r.$viewValue)
                            })
                        }
                    }
                }
            }, Ui = function() {
                return {
                    require: "ngModel",
                    link: function(e, t, r, i) {
                        var a = /\/(.*)\//.exec(r.ngList),
                            s = a && new RegExp(a[1]) || r.ngList || ",",
                            c = function(e) {
                                if (!v(e)) {
                                    var t = [];
                                    return e && o(e.split(s), function(e) {
                                        e && t.push(Nr(e))
                                    }), t
                                }
                            };
                        i.$parsers.push(c), i.$formatters.push(function(e) {
                            return x(e) ? e.join(", ") : n
                        }), i.$isEmpty = function(e) {
                            return !e || !e.length
                        }
                    }
                }
            }, Wi = /^(true|false|\d+)$/,
            Vi = function() {
                return {
                    priority: 100,
                    compile: function(e, t) {
                        return Wi.test(t.ngValue) ? function(e, t, n) {
                            n.$set("value", e.$eval(n.ngValue))
                        } : function(e, t, n) {
                            e.$watch(n.ngValue, function(e) {
                                n.$set("value", e)
                            })
                        }
                    }
                }
            }, Ji = nr(function(e, t, r) {
                t.addClass("ng-binding").data("$binding", r.ngBind), e.$watch(r.ngBind, function(e) {
                    t.text(e == n ? "" : e)
                })
            }),
            Xi = ["$interpolate",
                function(e) {
                    return function(t, n, r) {
                        var i = e(n.attr(r.$attr.ngBindTemplate));
                        n.addClass("ng-binding").data("$binding", i), r.$observe("ngBindTemplate", function(e) {
                            n.text(e)
                        })
                    }
                }
            ],
            Gi = ["$sce", "$parse",
                function(e, t) {
                    return function(n, r, i) {
                        function o() {
                            return (a(n) || "").toString()
                        }
                        r.addClass("ng-binding").data("$binding", i.ngBindHtml);
                        var a = t(i.ngBindHtml);
                        n.$watch(o, function() {
                            r.html(e.getTrustedHtml(a(n)) || "")
                        })
                    }
                }
            ],
            Ki = fr("", !0),
            Qi = fr("Odd", 0),
            Yi = fr("Even", 1),
            Zi = nr({
                compile: function(e, t) {
                    t.$set("ngCloak", n), e.removeClass("ng-cloak")
                }
            }),
            eo = [
                function() {
                    return {
                        scope: !0,
                        controller: "@",
                        priority: 500
                    }
                }
            ],
            to = {};
        o("click dblclick mousedown mouseup mouseover mouseout mousemove mouseenter mouseleave keydown keyup keypress submit focus blur copy cut paste".split(" "), function(e) {
            var t = Ht("ng-" + e);
            to[t] = ["$parse",
                function(n) {
                    return {
                        compile: function(r, i) {
                            var o = n(i[t]);
                            return function(t, n) {
                                n.on(pr(e), function(e) {
                                    t.$apply(function() {
                                        o(t, {
                                            $event: e
                                        })
                                    })
                                })
                            }
                        }
                    }
                }
            ]
        });
        var no = ["$animate",
                function(e) {
                    return {
                        transclude: "element",
                        priority: 600,
                        terminal: !0,
                        restrict: "A",
                        $$tlb: !0,
                        link: function(n, r, i, o, a) {
                            var s, c, l;
                            n.$watch(i.ngIf, function(o) {
                                W(o) ? c || (c = n.$new(), a(c, function(n) {
                                    n[n.length++] = t.createComment(" end ngIf: " + i.ngIf + " "), s = {
                                        clone: n
                                    }, e.enter(n, r.parent(), r)
                                })) : (l && (l.remove(), l = null), c && (c.$destroy(), c = null), s && (l = at(s.clone), e.leave(l, function() {
                                    l = null
                                }), s = null))
                            })
                        }
                    }
                }
            ],
            ro = ["$http", "$templateCache", "$anchorScroll", "$animate", "$sce",
                function(e, t, n, r, i) {
                    return {
                        restrict: "ECA",
                        priority: 400,
                        terminal: !0,
                        transclude: "element",
                        controller: Ar.noop,
                        compile: function(o, a) {
                            var s = a.ngInclude || a.src,
                                c = a.onload || "",
                                l = a.autoscroll;
                            return function(o, a, u, d, f) {
                                var p, h, g, m = 0,
                                    v = function() {
                                        h && (h.remove(), h = null), p && (p.$destroy(), p = null), g && (r.leave(g, function() {
                                            h = null
                                        }), h = g, g = null)
                                    };
                                o.$watch(i.parseAsResourceUrl(s), function(i) {
                                    var s = function() {
                                        !y(l) || l && !o.$eval(l) || n()
                                    }, u = ++m;
                                    i ? (e.get(i, {
                                        cache: t
                                    }).success(function(e) {
                                        if (u === m) {
                                            var t = o.$new();
                                            d.template = e;
                                            var n = f(t, function(e) {
                                                v(), r.enter(e, null, a, s)
                                            });
                                            p = t, g = n, p.$emit("$includeContentLoaded"), o.$eval(c)
                                        }
                                    }).error(function() {
                                        u === m && v()
                                    }), o.$emit("$includeContentRequested")) : (v(), d.template = null)
                                })
                            }
                        }
                    }
                }
            ],
            io = ["$compile",
                function(e) {
                    return {
                        restrict: "ECA",
                        priority: -400,
                        require: "ngInclude",
                        link: function(t, n, r, i) {
                            n.html(i.template), e(n.contents())(t)
                        }
                    }
                }
            ],
            oo = nr({
                priority: 450,
                compile: function() {
                    return {
                        pre: function(e, t, n) {
                            e.$eval(n.ngInit)
                        }
                    }
                }
            }),
            ao = nr({
                terminal: !0,
                priority: 1e3
            }),
            so = ["$locale", "$interpolate",
                function(e, t) {
                    var n = /{}/g;
                    return {
                        restrict: "EA",
                        link: function(r, i, a) {
                            var s = a.count,
                                c = a.$attr.when && i.attr(a.$attr.when),
                                l = a.offset || 0,
                                u = r.$eval(c) || {}, d = {}, f = t.startSymbol(),
                                p = t.endSymbol(),
                                h = /^when(Minus)?(.+)$/;
                            o(a, function(e, t) {
                                h.test(t) && (u[pr(t.replace("when", "").replace("Minus", "-"))] = i.attr(a.$attr[t]))
                            }), o(u, function(e, r) {
                                d[r] = t(e.replace(n, f + s + "-" + l + p))
                            }), r.$watch(function() {
                                var t = parseFloat(r.$eval(s));
                                return isNaN(t) ? "" : (t in u || (t = e.pluralCat(t - l)), d[t](r, i, !0))
                            }, function(e) {
                                i.text(e)
                            })
                        }
                    }
                }
            ],
            co = ["$parse", "$animate",
                function(e, n) {
                    function a(e) {
                        return e.clone[0]
                    }

                    function s(e) {
                        return e.clone[e.clone.length - 1]
                    }
                    var c = "$$NG_REMOVED",
                        l = r("ngRepeat");
                    return {
                        transclude: "element",
                        priority: 1e3,
                        terminal: !0,
                        $$tlb: !0,
                        link: function(r, u, d, f, p) {
                            var h, g, m, v, y, b, $, w, k, x = d.ngRepeat,
                                T = x.match(/^\s*([\s\S]+?)\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?\s*$/),
                                C = {
                                    $id: _t
                                };
                            if (!T) throw l("iexp", "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.", x);
                            if (b = T[1], $ = T[2], h = T[3], h ? (g = e(h), m = function(e, t, n) {
                                return k && (C[k] = e), C[w] = t, C.$index = n, g(r, C)
                            }) : (v = function(e, t) {
                                return _t(t)
                            }, y = function(e) {
                                return e
                            }), T = b.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/), !T) throw l("iidexp", "'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '{0}'.", b);
                            w = T[3] || T[1], k = T[2];
                            var S = {};
                            r.$watchCollection($, function(e) {
                                var d, f, h, g, b, $, T, C, A, E, N, j, _ = u[0],
                                    q = {}, M = [];
                                if (i(e)) E = e, A = m || v;
                                else {
                                    A = m || y, E = [];
                                    for ($ in e) e.hasOwnProperty($) && "$" != $.charAt(0) && E.push($);
                                    E.sort()
                                }
                                for (g = E.length, f = M.length = E.length, d = 0; f > d; d++)
                                    if ($ = e === E ? d : E[d], T = e[$], C = A($, T, d), it(C, "`track by` id"), S.hasOwnProperty(C)) N = S[C], delete S[C], q[C] = N, M[d] = N;
                                    else {
                                        if (q.hasOwnProperty(C)) throw o(M, function(e) {
                                            e && e.scope && (S[e.id] = e)
                                        }), l("dupes", "Duplicates in a repeater are not allowed. Use 'track by' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}", x, C);
                                        M[d] = {
                                            id: C
                                        }, q[C] = !1
                                    }
                                for ($ in S) S.hasOwnProperty($) && (N = S[$], j = at(N.clone), n.leave(j), o(j, function(e) {
                                    e[c] = !0
                                }), N.scope.$destroy());
                                for (d = 0, f = E.length; f > d; d++) {
                                    if ($ = e === E ? d : E[d], T = e[$], N = M[d], M[d - 1] && (_ = s(M[d - 1])), N.scope) {
                                        b = N.scope, h = _;
                                        do h = h.nextSibling; while (h && h[c]);
                                        a(N) != h && n.move(at(N.clone), null, br(_)), _ = s(N)
                                    } else b = r.$new();
                                    b[w] = T, k && (b[k] = $), b.$index = d, b.$first = 0 === d, b.$last = d === g - 1, b.$middle = !(b.$first || b.$last), b.$odd = !(b.$even = 0 === (1 & d)), N.scope || p(b, function(e) {
                                        e[e.length++] = t.createComment(" end ngRepeat: " + x + " "), n.enter(e, null, br(_)), _ = e, N.scope = b, N.clone = e, q[N.id] = N
                                    })
                                }
                                S = q
                            })
                        }
                    }
                }
            ],
            lo = ["$animate",
                function(e) {
                    return function(t, n, r) {
                        t.$watch(r.ngShow, function(t) {
                            e[W(t) ? "removeClass" : "addClass"](n, "ng-hide")
                        })
                    }
                }
            ],
            uo = ["$animate",
                function(e) {
                    return function(t, n, r) {
                        t.$watch(r.ngHide, function(t) {
                            e[W(t) ? "addClass" : "removeClass"](n, "ng-hide")
                        })
                    }
                }
            ],
            fo = nr(function(e, t, n) {
                e.$watch(n.ngStyle, function(e, n) {
                    n && e !== n && o(n, function(e, n) {
                        t.css(n, "")
                    }), e && t.css(e)
                }, !0)
            }),
            po = ["$animate",
                function(e) {
                    return {
                        restrict: "EA",
                        require: "ngSwitch",
                        controller: ["$scope",
                            function() {
                                this.cases = {}
                            }
                        ],
                        link: function(t, n, r, i) {
                            var a, s, c, l = r.ngSwitch || r.on,
                                u = [];
                            t.$watch(l, function(n) {
                                var l, d = u.length;
                                if (d > 0) {
                                    if (c) {
                                        for (l = 0; d > l; l++) c[l].remove();
                                        c = null
                                    }
                                    for (c = [], l = 0; d > l; l++) {
                                        var f = s[l];
                                        u[l].$destroy(), c[l] = f, e.leave(f, function() {
                                            c.splice(l, 1), 0 === c.length && (c = null)
                                        })
                                    }
                                }
                                s = [], u = [], (a = i.cases["!" + n] || i.cases["?"]) && (t.$eval(r.change), o(a, function(n) {
                                    var r = t.$new();
                                    u.push(r), n.transclude(r, function(t) {
                                        var r = n.element;
                                        s.push(t), e.enter(t, r.parent(), r)
                                    })
                                }))
                            })
                        }
                    }
                }
            ],
            ho = nr({
                transclude: "element",
                priority: 800,
                require: "^ngSwitch",
                link: function(e, t, n, r, i) {
                    r.cases["!" + n.ngSwitchWhen] = r.cases["!" + n.ngSwitchWhen] || [], r.cases["!" + n.ngSwitchWhen].push({
                        transclude: i,
                        element: t
                    })
                }
            }),
            go = nr({
                transclude: "element",
                priority: 800,
                require: "^ngSwitch",
                link: function(e, t, n, r, i) {
                    r.cases["?"] = r.cases["?"] || [], r.cases["?"].push({
                        transclude: i,
                        element: t
                    })
                }
            }),
            mo = nr({
                link: function(e, t, n, i, o) {
                    if (!o) throw r("ngTransclude")("orphan", "Illegal use of ngTransclude directive in the template! No parent directive that requires a transclusion found. Element: {0}", V(t));
                    o(function(e) {
                        t.empty(), t.append(e)
                    })
                }
            }),
            vo = ["$templateCache",
                function(e) {
                    return {
                        restrict: "E",
                        terminal: !0,
                        compile: function(t, n) {
                            if ("text/ng-template" == n.type) {
                                var r = n.id,
                                    i = t[0].text;
                                e.put(r, i)
                            }
                        }
                    }
                }
            ],
            yo = r("ngOptions"),
            bo = m({
                terminal: !0
            }),
            $o = ["$compile", "$parse",
                function(e, r) {
                    var i = /^\s*([\s\S]+?)(?:\s+as\s+([\s\S]+?))?(?:\s+group\s+by\s+([\s\S]+?))?\s+for\s+(?:([\$\w][\$\w]*)|(?:\(\s*([\$\w][\$\w]*)\s*,\s*([\$\w][\$\w]*)\s*\)))\s+in\s+([\s\S]+?)(?:\s+track\s+by\s+([\s\S]+?))?$/,
                        s = {
                            $setViewValue: h
                        };
                    return {
                        restrict: "E",
                        require: ["select", "?ngModel"],
                        controller: ["$element", "$scope", "$attrs",
                            function(e, t, n) {
                                var r, i, o = this,
                                    a = {}, c = s;
                                o.databound = n.ngModel, o.init = function(e, t, n) {
                                    c = e, r = t, i = n
                                }, o.addOption = function(t) {
                                    it(t, '"option value"'), a[t] = !0, c.$viewValue == t && (e.val(t), i.parent() && i.remove())
                                }, o.removeOption = function(e) {
                                    this.hasOption(e) && (delete a[e], c.$viewValue == e && this.renderUnknownOption(e))
                                }, o.renderUnknownOption = function(t) {
                                    var n = "? " + _t(t) + " ?";
                                    i.val(n), e.prepend(i), e.val(n), i.prop("selected", !0)
                                }, o.hasOption = function(e) {
                                    return a.hasOwnProperty(e)
                                }, t.$on("$destroy", function() {
                                    o.renderUnknownOption = h
                                })
                            }
                        ],
                        link: function(s, c, l, u) {
                            function d(e, t, n, r) {
                                n.$render = function() {
                                    var e = n.$viewValue;
                                    r.hasOption(e) ? (C.parent() && C.remove(), t.val(e), "" === e && h.prop("selected", !0)) : v(e) && h ? t.val("") : r.renderUnknownOption(e)
                                }, t.on("change", function() {
                                    e.$apply(function() {
                                        C.parent() && C.remove(), n.$setViewValue(t.val())
                                    })
                                })
                            }

                            function f(e, t, n) {
                                var r;
                                n.$render = function() {
                                    var e = new qt(n.$viewValue);
                                    o(t.find("option"), function(t) {
                                        t.selected = y(e.get(t.value))
                                    })
                                }, e.$watch(function() {
                                    L(r, n.$viewValue) || (r = I(n.$viewValue), n.$render())
                                }), t.on("change", function() {
                                    e.$apply(function() {
                                        var e = [];
                                        o(t.find("option"), function(t) {
                                            t.selected && e.push(t.value)
                                        }), n.$setViewValue(e)
                                    })
                                })
                            }

                            function p(t, o, s) {
                                function c() {
                                    var e, n, r, i, c, l, m, $, S, A, E, N, j, _, q, M = {
                                            "": []
                                        }, O = [""],
                                        I = s.$modelValue,
                                        D = g(t) || [],
                                        L = f ? a(D) : D,
                                        P = {}, F = !1;
                                    if (b)
                                        if (v && x(I)) {
                                            F = new qt([]);
                                            for (var R = 0; R < I.length; R++) P[d] = I[R], F.put(v(t, P), I[R])
                                        } else F = new qt(I);
                                    for (E = 0; S = L.length, S > E; E++) {
                                        if (m = E, f) {
                                            if (m = L[E], "$" === m.charAt(0)) continue;
                                            P[f] = m
                                        }
                                        if (P[d] = D[m], e = p(t, P) || "", (n = M[e]) || (n = M[e] = [], O.push(e)), b) N = y(F.remove(v ? v(t, P) : h(t, P)));
                                        else {
                                            if (v) {
                                                var z = {};
                                                z[d] = I, N = v(t, z) === v(t, P)
                                            } else N = I === h(t, P);
                                            F = F || N
                                        }
                                        q = u(t, P), q = y(q) ? q : "", n.push({
                                            id: v ? v(t, P) : f ? L[E] : E,
                                            label: q,
                                            selected: N
                                        })
                                    }
                                    for (b || (w || null === I ? M[""].unshift({
                                        id: "",
                                        label: "",
                                        selected: !F
                                    }) : F || M[""].unshift({
                                        id: "?",
                                        label: "",
                                        selected: !0
                                    })), A = 0, $ = O.length; $ > A; A++) {
                                        for (e = O[A], n = M[e], C.length <= A ? (i = {
                                            element: T.clone().attr("label", e),
                                            label: n.label
                                        }, c = [i], C.push(c), o.append(i.element)) : (c = C[A], i = c[0], i.label != e && i.element.attr("label", i.label = e)), j = null, E = 0, S = n.length; S > E; E++) r = n[E], (l = c[E + 1]) ? (j = l.element, l.label !== r.label && j.text(l.label = r.label), l.id !== r.id && j.val(l.id = r.id), l.selected !== r.selected && j.prop("selected", l.selected = r.selected)) : ("" === r.id && w ? _ = w : (_ = k.clone()).val(r.id).attr("selected", r.selected).text(r.label), c.push(l = {
                                            element: _,
                                            label: r.label,
                                            id: r.id,
                                            selected: r.selected
                                        }), j ? j.after(_) : i.element.append(_), j = _);
                                        for (E++; c.length > E;) c.pop().element.remove()
                                    }
                                    for (; C.length > A;) C.pop()[0].element.remove()
                                }
                                var l;
                                if (!(l = $.match(i))) throw yo("iexp", "Expected expression in form of '_select_ (as _label_)? for (_key_,)?_value_ in _collection_' but got '{0}'. Element: {1}", $, V(o));
                                var u = r(l[2] || l[1]),
                                    d = l[4] || l[6],
                                    f = l[5],
                                    p = r(l[3] || ""),
                                    h = r(l[2] ? l[1] : d),
                                    g = r(l[7]),
                                    m = l[8],
                                    v = m ? r(l[8]) : null,
                                    C = [
                                        [{
                                            element: o,
                                            label: ""
                                        }]
                                    ];
                                w && (e(w)(t), w.removeClass("ng-scope"), w.remove()), o.empty(), o.on("change", function() {
                                    t.$apply(function() {
                                        var e, r, i, a, c, l, u, p, m, y = g(t) || [],
                                            $ = {};
                                        if (b) {
                                            for (i = [], l = 0, p = C.length; p > l; l++)
                                                for (e = C[l], c = 1, u = e.length; u > c; c++)
                                                    if ((a = e[c].element)[0].selected) {
                                                        if (r = a.val(), f && ($[f] = r), v)
                                                            for (m = 0; m < y.length && ($[d] = y[m], v(t, $) != r); m++);
                                                        else $[d] = y[r];
                                                        i.push(h(t, $))
                                                    }
                                        } else {
                                            if (r = o.val(), "?" == r) i = n;
                                            else if ("" === r) i = null;
                                            else if (v) {
                                                for (m = 0; m < y.length; m++)
                                                    if ($[d] = y[m], v(t, $) == r) {
                                                        i = h(t, $);
                                                        break
                                                    }
                                            } else $[d] = y[r], f && ($[f] = r), i = h(t, $);
                                            C[0].length > 1 && C[0][1].id !== r && (C[0][1].selected = !1)
                                        }
                                        s.$setViewValue(i)
                                    })
                                }), s.$render = c, t.$watch(c)
                            }
                            if (u[1]) {
                                for (var h, g = u[0], m = u[1], b = l.multiple, $ = l.ngOptions, w = !1, k = br(t.createElement("option")), T = br(t.createElement("optgroup")), C = k.clone(), S = 0, A = c.children(), E = A.length; E > S; S++)
                                    if ("" === A[S].value) {
                                        h = w = A.eq(S);
                                        break
                                    }
                                g.init(m, w, C), b && (m.$isEmpty = function(e) {
                                    return !e || 0 === e.length
                                }), $ ? p(s, c, m) : b ? f(s, c, m) : d(s, c, m, g)
                            }
                        }
                    }
                }
            ],
            wo = ["$interpolate",
                function(e) {
                    var t = {
                        addOption: h,
                        removeOption: h
                    };
                    return {
                        restrict: "E",
                        priority: 100,
                        compile: function(n, r) {
                            if (v(r.value)) {
                                var i = e(n.text(), !0);
                                i || r.$set("value", n.text())
                            }
                            return function(e, n, r) {
                                var o = "$selectController",
                                    a = n.parent(),
                                    s = a.data(o) || a.parent().data(o);
                                s && s.databound ? n.prop("selected", !1) : s = t, i ? e.$watch(i, function(e, t) {
                                    r.$set("value", e), e !== t && s.removeOption(t), s.addOption(e)
                                }) : s.addOption(r.value), n.on("$destroy", function() {
                                    s.removeOption(r.value)
                                })
                            }
                        }
                    }
                }
            ],
            ko = m({
                restrict: "E",
                terminal: !0
            });
        return e.angular.bootstrap ? void console.log("WARNING: Tried to load angular more than once.") : (tt(), ct(Ar), void br(t).ready(function() {
            Y(t, Z)
        }))
    }(window, document), !angular.$$csp() && angular.element(document).find("head").prepend('<style type="text/css">@charset "UTF-8";[ng\\:cloak],[ng-cloak],[data-ng-cloak],[x-ng-cloak],.ng-cloak,.x-ng-cloak,.ng-hide{display:none !important;}ng\\:form{display:block;}.ng-animate-block-transitions{transition:0s all!important;-webkit-transition:0s all!important;}</style>');
var svgOldWinOnload = window.onload;
window.onload = function() {
    detectSVG(), svgOldWinOnload && svgOldWinOnload()
}, org.cometd.Utils = {}, org.cometd.Utils.isString = function(e) {
    return void 0 === e || null === e ? !1 : "string" == typeof e || e instanceof String
}, org.cometd.Utils.isArray = function(e) {
    return void 0 === e || null === e ? !1 : e instanceof Array
}, org.cometd.Utils.inArray = function(e, t) {
    for (var n = 0; n < t.length; ++n)
        if (e === t[n]) return n;
    return -1
}, org.cometd.Utils.setTimeout = function(e, t, n) {
    return window.setTimeout(function() {
        try {
            t()
        } catch (n) {
            e._debug("Exception invoking timed function", t, n)
        }
    }, n)
}, org.cometd.Utils.clearTimeout = function(e) {
    window.clearTimeout(e)
}, org.cometd.LongPollingTransport = function() {
    var e = new org.cometd.RequestTransport,
        t = org.cometd.Transport.derive(e),
        n = !0;
    return t.accept = function(e, t) {
        return n || !t
    }, t.xhrSend = function() {
        throw "Abstract"
    }, t.transportSend = function(e, t) {
        this._debug("Transport", this.getType(), "sending request", t.id, "envelope", e);
        var r = this;
        try {
            var i = !0;
            t.xhr = this.xhrSend({
                transport: this,
                url: e.url,
                sync: e.sync,
                headers: this.getConfiguration().requestHeaders,
                body: org.cometd.JSON.toJSON(e.messages),
                onSuccess: function(i) {
                    r._debug("Transport", r.getType(), "received response", i);
                    var o = !1;
                    try {
                        var a = r.convertToMessages(i);
                        0 === a.length ? (n = !1, r.transportFailure(e, t, {
                            httpCode: 204
                        })) : (o = !0, r.transportSuccess(e, t, a))
                    } catch (s) {
                        if (r._debug(s), !o) {
                            n = !1;
                            var c = {
                                exception: s
                            };
                            c.httpCode = r.xhrStatus(t.xhr), r.transportFailure(e, t, c)
                        }
                    }
                },
                onError: function(o, a) {
                    n = !1;
                    var s = {
                        reason: o,
                        exception: a
                    };
                    s.httpCode = r.xhrStatus(t.xhr), i ? r.setTimeout(function() {
                        r.transportFailure(e, t, s)
                    }, 0) : r.transportFailure(e, t, s)
                }
            }), i = !1
        } catch (o) {
            n = !1, this.setTimeout(function() {
                r.transportFailure(e, t, {
                    exception: o
                })
            }, 0)
        }
    }, t.reset = function() {
        e.reset(), n = !0
    }, t
}, org.cometd.WebSocketTransport = function() {
    function e() {
        if (!d) {
            d = !0;
            var e = r.getURL().replace(/^http/, "ws");
            this._debug("Transport", this.getType(), "connecting to URL", e);
            try {
                var t = r.getConfiguration().protocol,
                    n = t ? new org.cometd.WebSocket(e, t) : new org.cometd.WebSocket(e)
            } catch (i) {
                throw a = !1, this._debug("Exception while creating WebSocket object", i), i
            }
            c = r.getConfiguration().stickyReconnect !== !1;
            var o = this,
                s = null,
                l = r.getConfiguration().connectTimeout;
            l > 0 && (s = this.setTimeout(function() {
                s = null, o._debug("Transport", o.getType(), "timed out while connecting to URL", e, ":", l, "ms");
                var t = {
                    code: 1e3,
                    reason: "Connect Timeout"
                };
                o.webSocketClose(n, t.code, t.reason), o.onClose(n, t)
            }, l));
            var u = function() {
                o._debug("WebSocket opened", n), d = !1, s && (o.clearTimeout(s), s = null), f ? (r._warn("Closing Extra WebSocket Connections", n, f), o.webSocketClose(n, 1e3, "Extra Connection")) : o.onOpen(n)
            }, p = function(e) {
                e = e || {
                    code: 1e3
                }, o._debug("WebSocket closing", n, e), d = !1, s && (o.clearTimeout(s), s = null), null !== f && n !== f ? o._debug("Closed Extra WebSocket Connection", n) : o.onClose(n, e)
            }, h = function(e) {
                o._debug("WebSocket message", e, n), n !== f && r._warn("Extra WebSocket Connections", n, f), o.onMessage(n, e)
            };
            n.onopen = u, n.onclose = p, n.onerror = function() {
                p({
                    code: 1002,
                    reason: "Error"
                })
            }, n.onmessage = h, this._debug("Transport", this.getType(), "configured callbacks on", n)
        }
    }

    function t(e, t, n) {
        var r = org.cometd.JSON.toJSON(t.messages);
        e.send(r), this._debug("Transport", this.getType(), "sent", t, "metaConnect =", n);
        var i = this.getConfiguration().maxNetworkDelay,
            o = i;
        n && (o += this.getAdvice().timeout, p = !0);
        for (var a = this, s = [], c = 0; c < t.messages.length; ++c)! function() {
            var n = t.messages[c];
            n.id && (s.push(n.id), u[n.id] = this.setTimeout(function() {
                a._debug("Transport", a.getType(), "timing out message", n.id, "after", o, "on", e);
                var t = {
                    code: 1e3,
                    reason: "Message Timeout"
                };
                a.webSocketClose(e, t.code, t.reason), a.onClose(e, t)
            }, o))
        }();
        this._debug("Transport", this.getType(), "waiting at most", o, "ms for messages", s, "maxNetworkDelay", i, ", timeouts:", u)
    }

    function n(n, r, i) {
        try {
            null === n ? e.call(this) : t.call(this, n, r, i)
        } catch (o) {
            this.setTimeout(function() {
                r.onFailure(n, r.messages, {
                    exception: o
                })
            }, 0)
        }
    }
    var r, i = new org.cometd.Transport,
        o = org.cometd.Transport.derive(i),
        a = !0,
        s = !1,
        c = !0,
        l = {}, u = {}, d = !1,
        f = null,
        p = !1,
        h = null;
    return o.reset = function() {
        i.reset(), a = !0, s = !1, c = !0, l = {}, u = {}, d = !1, f = null, p = !1, h = null
    }, o.onOpen = function(e) {
        this._debug("Transport", this.getType(), "opened", e), f = e, s = !0, this._debug("Sending pending messages", l);
        for (var n in l) {
            var r = l[n],
                i = r[0],
                o = r[1];
            h = i.onSuccess, t.call(this, e, i, o)
        }
    }, o.onMessage = function(e, t) {
        this._debug("Transport", this.getType(), "received websocket message", t, e);
        for (var n = !1, r = this.convertToMessages(t.data), i = [], o = 0; o < r.length; ++o) {
            var a = r[o];
            if ((/^\/meta\//.test(a.channel) || void 0 !== a.successful) && a.id) {
                i.push(a.id);
                var s = u[a.id];
                s && (this.clearTimeout(s), delete u[a.id], this._debug("Transport", this.getType(), "removed timeout for message", a.id, ", timeouts", u))
            }
            "/meta/connect" === a.channel && (p = !1), "/meta/disconnect" !== a.channel || p || (n = !0)
        }
        for (var c = !1, d = 0; d < i.length; ++d) {
            var f = i[d];
            for (var g in l) {
                var m = g.split(","),
                    v = org.cometd.Utils.inArray(f, m);
                if (v >= 0) {
                    c = !0, m.splice(v, 1);
                    var y = l[g][0],
                        b = l[g][1];
                    delete l[g], m.length > 0 && (l[m.join(",")] = [y, b]);
                    break
                }
            }
        }
        c && this._debug("Transport", this.getType(), "removed envelope, envelopes", l), h && h.call(this, r), n && this.webSocketClose(e, 1e3, "Disconnect")
    }, o.onClose = function(e, t) {
        this._debug("Transport", this.getType(), "closed", e, t), a = c && s;
        var n = u;
        u = {};
        for (var r in n) this.clearTimeout(n[r]);
        var i = l;
        l = {};
        for (var o in i) {
            var d = i[o][0],
                h = i[o][1];
            h && (p = !1), d.onFailure(e, d.messages, {
                websocketCode: t.code,
                reason: t.reason
            })
        }
        f = null
    }, o.registered = function(e, t) {
        i.registered(e, t), r = t
    }, o.accept = function() {
        return a && !! org.cometd.WebSocket && r.websocketEnabled !== !1
    }, o.send = function(e, t) {
        this._debug("Transport", this.getType(), "sending", e, "metaConnect =", t);
        for (var r = [], i = 0; i < e.messages.length; ++i) {
            var o = e.messages[i];
            o.id && r.push(o.id)
        }
        l[r.join(",")] = [e, t], this._debug("Transport", this.getType(), "stored envelope, envelopes", l), n.call(this, f, e, t)
    }, o.webSocketClose = function(e, t, n) {
        try {
            e.close(t, n)
        } catch (r) {
            this._debug(r)
        }
    }, o.abort = function() {
        if (i.abort(), f) {
            var e = {
                code: 1001,
                reason: "Abort"
            };
            this.webSocketClose(f, e.code, e.reason), this.onClose(f, e)
        }
        this.reset()
    }, o
}, org.cometd.CallbackPollingTransport = function() {
    var e = new org.cometd.RequestTransport,
        t = org.cometd.Transport.derive(e),
        n = 2e3;
    return t.accept = function() {
        return !0
    }, t.jsonpSend = function() {
        throw "Abstract"
    }, t.transportSend = function(e, t) {
        for (var r = this, i = 0, o = e.messages.length, a = []; o > 0;) {
            var s = org.cometd.JSON.toJSON(e.messages.slice(i, i + o)),
                c = e.url.length + encodeURI(s).length;
            if (c > n) {
                if (1 === o) return void this.setTimeout(function() {
                    r.transportFailure(e, t, {
                        reason: "Bayeux message too big, max is " + n
                    })
                }, 0);
                --o
            } else a.push(o), i += o, o = e.messages.length - i
        }
        var l = e;
        if (a.length > 1) {
            var u = 0,
                d = a[0];
            this._debug("Transport", this.getType(), "split", e.messages.length, "messages into", a.join(" + ")), l = this._mixin(!1, {}, e), l.messages = e.messages.slice(u, d), l.onSuccess = e.onSuccess, l.onFailure = e.onFailure;
            for (var f = 1; f < a.length; ++f) {
                var p = this._mixin(!1, {}, e);
                u = d, d += a[f], p.messages = e.messages.slice(u, d), p.onSuccess = e.onSuccess, p.onFailure = e.onFailure, this.send(p, t.metaConnect)
            }
        }
        this._debug("Transport", this.getType(), "sending request", t.id, "envelope", l);
        try {
            var h = !0;
            this.jsonpSend({
                transport: this,
                url: l.url,
                sync: l.sync,
                headers: this.getConfiguration().requestHeaders,
                body: org.cometd.JSON.toJSON(l.messages),
                onSuccess: function(e) {
                    var n = !1;
                    try {
                        var i = r.convertToMessages(e);
                        0 === i.length ? r.transportFailure(l, t, {
                            httpCode: 204
                        }) : (n = !0, r.transportSuccess(l, t, i))
                    } catch (o) {
                        r._debug(o), n || r.transportFailure(l, t, {
                            exception: o
                        })
                    }
                },
                onError: function(e, n) {
                    var i = {
                        reason: e,
                        exception: n
                    };
                    h ? r.setTimeout(function() {
                        r.transportFailure(l, t, i)
                    }, 0) : r.transportFailure(l, t, i)
                }
            }), h = !1
        } catch (g) {
            this.setTimeout(function() {
                r.transportFailure(l, t, {
                    exception: g
                })
            }, 0)
        }
    }, t
}, org.cometd.RequestTransport = function() {
    function e(e) {
        for (; d.length > 0;) {
            var t = d[0],
                n = t[0],
                r = t[1];
            if (n.url !== e.url || n.sync !== e.sync) break;
            d.shift(), e.messages = e.messages.concat(n.messages), this._debug("Coalesced", n.messages.length, "messages from request", r.id)
        }
    }

    function t(e, t) {
        if (this.transportSend(e, t), t.expired = !1, !e.sync) {
            var n = this.getConfiguration().maxNetworkDelay,
                r = n;
            t.metaConnect === !0 && (r += this.getAdvice().timeout), this._debug("Transport", this.getType(), "waiting at most", r, "ms for the response, maxNetworkDelay", n);
            var i = this;
            t.timeout = this.setTimeout(function() {
                t.expired = !0;
                var n = "Request " + t.id + " of transport " + i.getType() + " exceeded " + r + " ms max network delay",
                    o = {
                        reason: n
                    }, a = t.xhr;
                o.httpCode = i.xhrStatus(a), i.abortXHR(a), i._debug(n), i.complete(t, !1, t.metaConnect), e.onFailure(a, e.messages, o)
            }, r)
        }
    }

    function n(e) {
        var n = ++c,
            r = {
                id: n,
                metaConnect: !1
            };
        u.length < this.getConfiguration().maxConnections - 1 ? (u.push(r), t.call(this, e, r)) : (this._debug("Transport", this.getType(), "queueing request", n, "envelope", e), d.push([e, r]))
    }

    function r(e) {
        var t = e.id;
        if (this._debug("Transport", this.getType(), "metaConnect complete, request", t), null !== l && l.id !== t) throw "Longpoll request mismatch, completing request " + t;
        l = null
    }

    function i(t, r) {
        var i = org.cometd.Utils.inArray(t, u);
        if (i >= 0 && u.splice(i, 1), d.length > 0) {
            var o = d.shift(),
                a = o[0],
                s = o[1];
            if (this._debug("Transport dequeued request", s.id), r) this.getConfiguration().autoBatch && e.call(this, a), n.call(this, a), this._debug("Transport completed request", t.id, a);
            else {
                var c = this;
                this.setTimeout(function() {
                    c.complete(s, !1, s.metaConnect);
                    var e = {
                        reason: "Previous request failed"
                    }, t = s.xhr;
                    e.httpCode = c.xhrStatus(t), a.onFailure(t, a.messages, e)
                }, 0)
            }
        }
    }

    function o(e) {
        if (null !== l) throw "Concurrent metaConnect requests not allowed, request id=" + l.id + " not yet completed";
        var n = ++c;
        this._debug("Transport", this.getType(), "metaConnect send, request", n, "envelope", e);
        var r = {
            id: n,
            metaConnect: !0
        };
        t.call(this, e, r), l = r
    }
    var a = new org.cometd.Transport,
        s = org.cometd.Transport.derive(a),
        c = 0,
        l = null,
        u = [],
        d = [];
    return s.complete = function(e, t, n) {
        n ? r.call(this, e) : i.call(this, e, t)
    }, s.transportSend = function() {
        throw "Abstract"
    }, s.transportSuccess = function(e, t, n) {
        t.expired || (this.clearTimeout(t.timeout), this.complete(t, !0, t.metaConnect), n && n.length > 0 ? e.onSuccess(n) : e.onFailure(t.xhr, e.messages, {
            httpCode: 204
        }))
    }, s.transportFailure = function(e, t, n) {
        t.expired || (this.clearTimeout(t.timeout), this.complete(t, !1, t.metaConnect), e.onFailure(t.xhr, e.messages, n))
    }, s.send = function(e, t) {
        t ? o.call(this, e) : n.call(this, e)
    }, s.abort = function() {
        a.abort();
        for (var e = 0; e < u.length; ++e) {
            var t = u[e];
            this._debug("Aborting request", t), this.abortXHR(t.xhr)
        }
        l && (this._debug("Aborting metaConnect request", l), this.abortXHR(l.xhr)), this.reset()
    }, s.reset = function() {
        a.reset(), l = null, u = [], d = []
    }, s.abortXHR = function(e) {
        if (e) try {
            e.abort()
        } catch (t) {
            this._debug(t)
        }
    }, s.xhrStatus = function(e) {
        if (e) try {
            return e.status
        } catch (t) {
            this._debug(t)
        }
        return -1
    }, s
}, org.cometd.TransportRegistry = function() {
    var e = [],
        t = {};
    this.getTransportTypes = function() {
        return e.slice(0)
    }, this.findTransportTypes = function(n, r, i) {
        for (var o = [], a = 0; a < e.length; ++a) {
            var s = e[a];
            t[s].accept(n, r, i) === !0 && o.push(s)
        }
        return o
    }, this.negotiateTransport = function(n, r, i, o) {
        for (var a = 0; a < e.length; ++a)
            for (var s = e[a], c = 0; c < n.length; ++c)
                if (s === n[c]) {
                    var l = t[s];
                    if (l.accept(r, i, o) === !0) return l
                }
        return null
    }, this.add = function(n, r, i) {
        for (var o = !1, a = 0; a < e.length; ++a)
            if (e[a] === n) {
                o = !0;
                break
            }
        return o || ("number" != typeof i ? e.push(n) : e.splice(i, 0, n), t[n] = r), !o
    }, this.find = function(n) {
        for (var r = 0; r < e.length; ++r)
            if (e[r] === n) return t[n];
        return null
    }, this.remove = function(n) {
        for (var r = 0; r < e.length; ++r)
            if (e[r] === n) {
                e.splice(r, 1);
                var i = t[n];
                return delete t[n], i
            }
        return null
    }, this.clear = function() {
        e = [], t = {}
    }, this.reset = function() {
        for (var n = 0; n < e.length; ++n) t[e[n]].reset()
    }
}, org.cometd.Transport = function() {
    var e, t;
    this.registered = function(n, r) {
        e = n, t = r
    }, this.unregistered = function() {
        e = null, t = null
    }, this._debug = function() {
        t._debug.apply(t, arguments)
    }, this._mixin = function() {
        return t._mixin.apply(t, arguments)
    }, this.getConfiguration = function() {
        return t.getConfiguration()
    }, this.getAdvice = function() {
        return t.getAdvice()
    }, this.setTimeout = function(e, n) {
        return org.cometd.Utils.setTimeout(t, e, n)
    }, this.clearTimeout = function(e) {
        org.cometd.Utils.clearTimeout(e)
    }, this.convertToMessages = function(e) {
        if (org.cometd.Utils.isString(e)) try {
            return org.cometd.JSON.fromJSON(e)
        } catch (t) {
            throw this._debug("Could not convert to JSON the following string", '"' + e + '"'), t
        }
        if (org.cometd.Utils.isArray(e)) return e;
        if (void 0 === e || null === e) return [];
        if (e instanceof Object) return [e];
        throw "Conversion Error " + e + ", typeof " + typeof e
    }, this.accept = function() {
        throw "Abstract"
    }, this.getType = function() {
        return e
    }, this.send = function() {
        throw "Abstract"
    }, this.reset = function() {
        this._debug("Transport", e, "reset")
    }, this.abort = function() {
        this._debug("Transport", e, "aborted")
    }, this.toString = function() {
        return this.getType()
    }
}, org.cometd.Transport.derive = function(e) {
    function t() {}
    return t.prototype = e, new t
}, org.cometd.Cometd = function(e) {
    function t(e, t) {
        try {
            return e[t]
        } catch (n) {
            return void 0
        }
    }

    function n(e) {
        return org.cometd.Utils.isString(e)
    }

    function r(e) {
        return void 0 === e || null === e ? !1 : "function" == typeof e
    }

    function i(e, t) {
        if (window.console) {
            var n = window.console[e];
            r(n) && n.apply(window.console, t)
        }
    }

    function o(e) {
        ot._debug("Configuring cometd object with", e), n(e) && (e = {
            url: e
        }), e || (e = {}), xt = ot._mixin(!1, xt, e);
        var t = ot.getURL();
        if (!t) throw "Missing required configuration parameter 'url' specifying the Bayeux server URL";
        var r = /(^https?:\/\/)?(((\[[^\]]+\])|([^:\/\?#]+))(:(\d+))?)?([^\?#]*)(.*)?/.exec(t),
            i = r[2],
            o = r[8],
            a = r[9];
        if (st = ot._isCrossDomain(i), xt.appendMessageTypeToURL)
            if (void 0 !== a && a.length > 0) ot._info("Appending message type to URI " + o + a + " is not supported, disabling 'appendMessageTypeToURL' configuration"), xt.appendMessageTypeToURL = !1;
            else {
                var s = o.split("/"),
                    c = s.length - 1;
                o.match(/\/$/) && (c -= 1), s[c].indexOf(".") >= 0 && (ot._info("Appending message type to URI " + o + " is not supported, disabling 'appendMessageTypeToURL' configuration"), xt.appendMessageTypeToURL = !1)
            }
    }

    function a(e) {
        if (e) {
            var t = gt[e.channel];
            t && t[e.id] && (delete t[e.id], ot._debug("Removed", e.listener ? "listener" : "subscription", e))
        }
    }

    function s(e) {
        e && !e.listener && a(e)
    }

    function c() {
        for (var e in gt) {
            var t = gt[e];
            if (t)
                for (var n = 0; n < t.length; ++n) s(t[n])
        }
    }

    function l(e) {
        lt !== e && (ot._debug("Status", lt, "->", e), lt = e)
    }

    function u() {
        return "disconnecting" === lt || "disconnected" === lt
    }

    function d() {
        return ++ut
    }

    function f(e, t, n, i, o) {
        try {
            return t.call(e, i)
        } catch (a) {
            ot._debug("Exception during execution of extension", n, a);
            var s = ot.onExtensionException;
            if (r(s)) {
                ot._debug("Invoking extension exception callback", n, a);
                try {
                    s.call(ot, a, n, o, i)
                } catch (c) {
                    ot._info("Exception during execution of exception callback in extension", n, c)
                }
            }
            return i
        }
    }

    function p(e) {
        for (var t = 0; t < yt.length && (void 0 !== e && null !== e); ++t) {
            var n = xt.reverseIncomingExtensions ? yt.length - 1 - t : t,
                i = yt[n],
                o = i.extension.incoming;
            if (r(o)) {
                var a = f(i.extension, o, i.name, e, !1);
                e = void 0 === a ? e : a
            }
        }
        return e
    }

    function h(e) {
        for (var t = 0; t < yt.length && (void 0 !== e && null !== e); ++t) {
            var n = yt[t],
                i = n.extension.outgoing;
            if (r(i)) {
                var o = f(n.extension, i, n.name, e, !0);
                e = void 0 === o ? e : o
            }
        }
        return e
    }

    function g(e, t) {
        var n = gt[e];
        if (n && n.length > 0)
            for (var i = 0; i < n.length; ++i) {
                var o = n[i];
                if (o) try {
                    o.callback.call(o.scope, t)
                } catch (a) {
                    ot._debug("Exception during notification", o, t, a);
                    var s = ot.onListenerException;
                    if (r(s)) {
                        ot._debug("Invoking listener exception callback", o, a);
                        try {
                            s.call(ot, a, o, o.listener, t)
                        } catch (c) {
                            ot._info("Exception during execution of listener callback", o, c)
                        }
                    }
                }
            }
    }

    function m(e, t) {
        g(e, t);
        for (var n = e.split("/"), r = n.length - 1, i = r; i > 0; --i) {
            var o = n.slice(0, i).join("/") + "/*";
            i === r && g(o, t), o += "*", g(o, t)
        }
    }

    function v() {
        null !== vt && org.cometd.Utils.clearTimeout(vt), vt = null
    }

    function y(e) {
        v();
        var t = bt.interval + mt;
        ot._debug("Function scheduled in", t, "ms, interval =", bt.interval, "backoff =", mt, e), vt = org.cometd.Utils.setTimeout(ot, e, t)
    }

    function b(e, t, n, i) {
        for (var o = 0; o < t.length; ++o) {
            var a = t[o],
                s = "" + d();
            a.id = s, dt && (a.clientId = dt);
            var c = void 0;
            r(a._callback) && (c = a._callback, delete a._callback), a = h(a), void 0 !== a && null !== a ? (a.id = s, t[o] = a, c && ($t[s] = c)) : t.splice(o--, 1)
        }
        if (0 !== t.length) {
            var l = ot.getURL();
            xt.appendMessageTypeToURL && (l.match(/\/$/) || (l += "/"), i && (l += i));
            var u = {
                url: l,
                sync: e,
                messages: t,
                onSuccess: function(e) {
                    try {
                        Tt.call(ot, e)
                    } catch (t) {
                        ot._debug("Exception during handling of messages", t)
                    }
                },
                onFailure: function(e, t, n) {
                    try {
                        var r = ot.getTransport();
                        n.connectionType = r ? r.getType() : "unknown", Ct.call(ot, e, t, n)
                    } catch (i) {
                        ot._debug("Exception during handling of failure", i)
                    }
                }
            };
            ot._debug("Send", u), nt.send(u, n)
        }
    }

    function $(e) {
        ft > 0 || ht === !0 ? pt.push(e) : b(!1, [e], !1)
    }

    function w() {
        mt = 0
    }

    function k() {
        mt < xt.maxBackoff && (mt += xt.backoffIncrement)
    }

    function x() {
        ++ft
    }

    function T() {
        var e = pt;
        pt = [], e.length > 0 && b(!1, e, !1)
    }

    function C() {
        if (--ft, 0 > ft) throw "Calls to startBatch() and endBatch() are not paired";
        0 !== ft || u() || ht || T()
    }

    function S() {
        if (!u()) {
            var e = {
                channel: "/meta/connect",
                connectionType: nt.getType()
            };
            kt || (e.advice = {
                timeout: 0
            }), l("connecting"), ot._debug("Connect sent", e), b(!1, [e], !0, "connect"), l("connected")
        }
    }

    function A() {
        l("connecting"), y(function() {
            S()
        })
    }

    function E(e) {
        e && (bt = ot._mixin(!1, {}, xt.advice, e), ot._debug("New advice", bt))
    }

    function N(e) {
        if (v(), e && nt && nt.abort(), dt = null, l("disconnected"), ft = 0, w(), nt = null, pt.length > 0) {
            var t = pt;
            pt = [], Ct.call(ot, void 0, t, {
                reason: "Disconnected"
            })
        }
    }

    function j(e, t, n) {
        var i = ot.onTransportFailure;
        if (r(i)) {
            ot._debug("Invoking transport failure callback", e, t, n);
            try {
                i.call(ot, e, t, n)
            } catch (o) {
                ot._info("Exception during execution of transport failure callback", o)
            }
        }
    }

    function _(e, t) {
        r(e) && (t = e, e = void 0), dt = null, c(), u() ? (ct.reset(), E(xt.advice)) : E(ot._mixin(!1, bt, {
            reconnect: "retry"
        })), ft = 0, ht = !0, rt = e, it = t;
        var n = "1.0",
            i = ot.getURL(),
            o = ct.findTransportTypes(n, st, i),
            a = {
                version: n,
                minimumVersion: n,
                channel: "/meta/handshake",
                supportedConnectionTypes: o,
                _callback: t,
                advice: {
                    timeout: bt.timeout,
                    interval: bt.interval
                }
            }, s = ot._mixin(!1, {}, rt, a);
        if (!nt && (nt = ct.negotiateTransport(o, n, st, i), !nt)) {
            var d = "Could not find initial transport among: " + ct.getTransportTypes();
            throw ot._warn(d), d
        }
        ot._debug("Initial transport is", nt.getType()), l("handshaking"), ot._debug("Handshake sent", s), b(!1, [s], !1, "handshake")
    }

    function q() {
        l("handshaking"), ht = !0, y(function() {
            _(rt, it)
        })
    }

    function M(e) {
        var t = $t[e.id];
        r(t) && (delete $t[e.id], t.call(ot, e))
    }

    function O(e) {
        M(e), m("/meta/handshake", e), m("/meta/unsuccessful", e);
        var t = !u() && "none" !== bt.reconnect;
        t ? (k(), q()) : N(!1)
    }

    function I(e) {
        if (e.successful) {
            dt = e.clientId;
            var t = ot.getURL(),
                n = ct.negotiateTransport(e.supportedConnectionTypes, e.version, st, t);
            if (null === n) {
                var r = "Could not negotiate transport with server; client=[" + ct.findTransportTypes(e.version, st, t) + "], server=[" + e.supportedConnectionTypes + "]",
                    i = ot.getTransport();
                return j(i.getType(), null, {
                    reason: r,
                    connectionType: i.getType(),
                    transport: i
                }), ot._warn(r), void N(!0)
            }
            nt !== n && (ot._debug("Transport", nt.getType(), "->", n.getType()), nt = n), ht = !1, T(), e.reestablish = wt, wt = !0, M(e), m("/meta/handshake", e);
            var o = u() ? "none" : bt.reconnect;
            switch (o) {
                case "retry":
                    w(), A();
                    break;
                case "none":
                    N(!1);
                    break;
                default:
                    throw "Unrecognized advice action " + o
            }
        } else O(e)
    }

    function D(e) {
        var t = "1.0",
            n = ot.getURL(),
            r = ot.getTransport(),
            i = ct.findTransportTypes(t, st, n),
            o = ct.negotiateTransport(i, t, st, n);
        o ? (ot._debug("Transport", r.getType(), "->", o.getType()), j(r.getType(), o.getType(), e.failure), O(e), nt = o) : (j(r.getType(), null, e.failure), ot._warn("Could not negotiate transport; client=[" + i + "]"), N(!0), O(e))
    }

    function L(e) {
        m("/meta/connect", e), m("/meta/unsuccessful", e);
        var t = u() ? "none" : bt.reconnect;
        switch (t) {
            case "retry":
                A(), k();
                break;
            case "handshake":
                ct.reset(), w(), q();
                break;
            case "none":
                N(!1);
                break;
            default:
                throw "Unrecognized advice action" + t
        }
    }

    function P(e) {
        if (kt = e.successful) {
            m("/meta/connect", e);
            var t = u() ? "none" : bt.reconnect;
            switch (t) {
                case "retry":
                    w(), A();
                    break;
                case "none":
                    N(!1);
                    break;
                default:
                    throw "Unrecognized advice action " + t
            }
        } else L(e)
    }

    function F(e) {
        kt = !1, L(e)
    }

    function R(e) {
        N(!0), M(e), m("/meta/disconnect", e), m("/meta/unsuccessful", e)
    }

    function z(e) {
        e.successful ? (N(!1), M(e), m("/meta/disconnect", e)) : R(e)
    }

    function H(e) {
        R(e)
    }

    function B(e) {
        var t = gt[e.subscription];
        if (t)
            for (var n = t.length - 1; n >= 0; --n) {
                var r = t[n];
                if (r && !r.listener) {
                    delete t[n], ot._debug("Removed failed subscription", r);
                    break
                }
            }
        M(e), m("/meta/subscribe", e), m("/meta/unsuccessful", e)
    }

    function U(e) {
        e.successful ? (M(e), m("/meta/subscribe", e)) : B(e)
    }

    function W(e) {
        B(e)
    }

    function V(e) {
        M(e), m("/meta/unsubscribe", e), m("/meta/unsuccessful", e)
    }

    function J(e) {
        e.successful ? (M(e), m("/meta/unsubscribe", e)) : V(e)
    }

    function X(e) {
        V(e)
    }

    function G(e) {
        M(e), m("/meta/publish", e), m("/meta/unsuccessful", e)
    }

    function K(e) {
        void 0 === e.successful ? void 0 !== e.data ? m(e.channel, e) : ot._warn("Unknown Bayeux Message", e) : e.successful ? (M(e), m("/meta/publish", e)) : G(e)
    }

    function Q(e) {
        G(e)
    }

    function Y(e) {
        if (e = p(e), void 0 !== e && null !== e) {
            E(e.advice);
            var t = e.channel;
            switch (t) {
                case "/meta/handshake":
                    I(e);
                    break;
                case "/meta/connect":
                    P(e);
                    break;
                case "/meta/disconnect":
                    z(e);
                    break;
                case "/meta/subscribe":
                    U(e);
                    break;
                case "/meta/unsubscribe":
                    J(e);
                    break;
                default:
                    K(e)
            }
        }
    }

    function Z(e) {
        var t = gt[e];
        if (t)
            for (var n = 0; n < t.length; ++n)
                if (t[n]) return !0;
        return !1
    }

    function et(e, t) {
        var i = {
            scope: e,
            method: t
        };
        if (r(e)) i.scope = void 0, i.method = e;
        else if (n(t)) {
            if (!e) throw "Invalid scope " + e;
            if (i.method = e[t], !r(i.method)) throw "Invalid callback " + t + " for scope " + e
        } else if (!r(t)) throw "Invalid callback " + t;
        return i
    }

    function tt(e, t, n, r) {
        var i = et(t, n);
        ot._debug("Adding", r ? "listener" : "subscription", "on", e, "with scope", i.scope, "and callback", i.method);
        var o = {
            channel: e,
            scope: i.scope,
            callback: i.method,
            listener: r
        }, a = gt[e];
        return a || (a = [], gt[e] = a), o.id = a.push(o) - 1, ot._debug("Added", r ? "listener" : "subscription", o), o[0] = e, o[1] = o.id, o
    }
    var nt, rt, it, ot = this,
        at = e || "default",
        st = !1,
        ct = new org.cometd.TransportRegistry,
        lt = "disconnected",
        ut = 0,
        dt = null,
        ft = 0,
        pt = [],
        ht = !1,
        gt = {}, mt = 0,
        vt = null,
        yt = [],
        bt = {}, $t = {}, wt = !1,
        kt = !1,
        xt = {
            protocol: null,
            stickyReconnect: !0,
            connectTimeout: 0,
            maxConnections: 2,
            backoffIncrement: 1e3,
            maxBackoff: 6e4,
            logLevel: "info",
            reverseIncomingExtensions: !0,
            maxNetworkDelay: 1e4,
            requestHeaders: {},
            appendMessageTypeToURL: !0,
            autoBatch: !1,
            advice: {
                timeout: 6e4,
                interval: 0,
                reconnect: "retry"
            }
        };
    this._mixin = function(e, n) {
        for (var r = n || {}, i = 2; i < arguments.length; ++i) {
            var o = arguments[i];
            if (void 0 !== o && null !== o)
                for (var a in o) {
                    var s = t(o, a),
                        c = t(r, a);
                    if (s !== n && void 0 !== s)
                        if (e && "object" == typeof s && null !== s)
                            if (s instanceof Array) r[a] = this._mixin(e, c instanceof Array ? c : [], s);
                            else {
                                var l = "object" != typeof c || c instanceof Array ? {} : c;
                                r[a] = this._mixin(e, l, s)
                            } else r[a] = s
                }
        }
        return r
    }, this._warn = function() {
        i("warn", arguments)
    }, this._info = function() {
        "warn" !== xt.logLevel && i("info", arguments)
    }, this._debug = function() {
        "debug" === xt.logLevel && i("debug", arguments)
    }, this._isCrossDomain = function(e) {
        return e && e !== window.location.host
    };
    var Tt, Ct;
    this.send = $, this.receive = Y, Tt = function(e) {
        ot._debug("Received", e);
        for (var t = 0; t < e.length; ++t) {
            var n = e[t];
            Y(n)
        }
    }, Ct = function(e, t, n) {
        ot._debug("handleFailure", e, t, n), n.transport = e;
        for (var r = 0; r < t.length; ++r) {
            var i = t[r],
                o = {
                    id: i.id,
                    successful: !1,
                    channel: i.channel,
                    failure: n
                };
            switch (n.message = i, i.channel) {
                case "/meta/handshake":
                    D(o);
                    break;
                case "/meta/connect":
                    F(o);
                    break;
                case "/meta/disconnect":
                    H(o);
                    break;
                case "/meta/subscribe":
                    o.subscription = i.subscription, W(o);
                    break;
                case "/meta/unsubscribe":
                    o.subscription = i.subscription, X(o);
                    break;
                default:
                    Q(o)
            }
        }
    }, this.registerTransport = function(e, t, n) {
        var i = ct.add(e, t, n);
        return i && (this._debug("Registered transport", e), r(t.registered) && t.registered(e, this)), i
    }, this.getTransportTypes = function() {
        return ct.getTransportTypes()
    }, this.unregisterTransport = function(e) {
        var t = ct.remove(e);
        return null !== t && (this._debug("Unregistered transport", e), r(t.unregistered) && t.unregistered()), t
    }, this.unregisterTransports = function() {
        ct.clear()
    }, this.findTransport = function(e) {
        return ct.find(e)
    }, this.configure = function(e) {
        o.call(this, e)
    }, this.init = function(e, t) {
        this.configure(e), this.handshake(t)
    }, this.handshake = function(e, t) {
        l("disconnected"), wt = !1, _(e, t)
    }, this.disconnect = function(e, t, n) {
        if (!u()) {
            "boolean" != typeof e && (n = t, t = e, e = !1), r(t) && (n = t, t = void 0);
            var i = {
                channel: "/meta/disconnect",
                _callback: n
            }, o = this._mixin(!1, {}, t, i);
            l("disconnecting"), b(e === !0, [o], !1, "disconnect")
        }
    }, this.startBatch = function() {
        x()
    }, this.endBatch = function() {
        C()
    }, this.batch = function(e, t) {
        var n = et(e, t);
        this.startBatch();
        try {
            n.method.call(n.scope), this.endBatch()
        } catch (r) {
            throw this._info("Exception during execution of batch", r), this.endBatch(), r
        }
    }, this.addListener = function(e, t, r) {
        if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
        if (!n(e)) throw "Illegal argument type: channel must be a string";
        return tt(e, t, r, !0)
    }, this.removeListener = function(e) {
        if (!(e && e.channel && "id" in e)) throw "Invalid argument: expected subscription, not " + e;
        a(e)
    }, this.clearListeners = function() {
        gt = {}
    }, this.subscribe = function(e, t, i, o, a) {
        if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
        if (!n(e)) throw "Illegal argument type: channel must be a string";
        if (u()) throw "Illegal state: already disconnected";
        r(t) && (a = o, o = i, i = t, t = void 0), r(o) && (a = o, o = void 0);
        var s = !Z(e),
            c = tt(e, t, i, !1);
        if (s) {
            var l = {
                channel: "/meta/subscribe",
                subscription: e,
                _callback: a
            }, d = this._mixin(!1, {}, o, l);
            $(d)
        }
        return c
    }, this.unsubscribe = function(e, t, n) {
        if (arguments.length < 1) throw "Illegal arguments number: required 1, got " + arguments.length;
        if (u()) throw "Illegal state: already disconnected";
        r(t) && (n = t, t = void 0), this.removeListener(e);
        var i = e.channel;
        if (!Z(i)) {
            var o = {
                channel: "/meta/unsubscribe",
                subscription: i,
                _callback: n
            }, a = this._mixin(!1, {}, t, o);
            $(a)
        }
    }, this.resubscribe = function(e, t) {
        return s(e), e ? this.subscribe(e.channel, e.scope, e.callback, t) : void 0
    }, this.clearSubscriptions = function() {
        c()
    }, this.publish = function(e, t, i, o) {
        if (arguments.length < 1) throw "Illegal arguments number: required 1, got " + arguments.length;
        if (!n(e)) throw "Illegal argument type: channel must be a string";
        if (/^\/meta\//.test(e)) throw "Illegal argument: cannot publish to meta channels";
        if (u()) throw "Illegal state: already disconnected";
        r(t) ? (o = t, t = i = {}) : r(i) && (o = i, i = {});
        var a = {
            channel: e,
            data: t,
            _callback: o
        }, s = this._mixin(!1, {}, i, a);
        $(s)
    }, this.getStatus = function() {
        return lt
    }, this.isDisconnected = u, this.setBackoffIncrement = function(e) {
        xt.backoffIncrement = e
    }, this.getBackoffIncrement = function() {
        return xt.backoffIncrement
    }, this.getBackoffPeriod = function() {
        return mt
    }, this.setLogLevel = function(e) {
        xt.logLevel = e
    }, this.registerExtension = function(e, t) {
        if (arguments.length < 2) throw "Illegal arguments number: required 2, got " + arguments.length;
        if (!n(e)) throw "Illegal argument type: extension name must be a string";
        for (var i = !1, o = 0; o < yt.length; ++o) {
            var a = yt[o];
            if (a.name === e) {
                i = !0;
                break
            }
        }
        return i ? (this._info("Could not register extension with name", e, "since another extension with the same name already exists"), !1) : (yt.push({
            name: e,
            extension: t
        }), this._debug("Registered extension", e), r(t.registered) && t.registered(e, this), !0)
    }, this.unregisterExtension = function(e) {
        if (!n(e)) throw "Illegal argument type: extension name must be a string";
        for (var t = !1, i = 0; i < yt.length; ++i) {
            var o = yt[i];
            if (o.name === e) {
                yt.splice(i, 1), t = !0, this._debug("Unregistered extension", e);
                var a = o.extension;
                r(a.unregistered) && a.unregistered();
                break
            }
        }
        return t
    }, this.getExtension = function(e) {
        for (var t = 0; t < yt.length; ++t) {
            var n = yt[t];
            if (n.name === e) return n.extension
        }
        return null
    }, this.getName = function() {
        return at
    }, this.getClientId = function() {
        return dt
    }, this.getURL = function() {
        if (nt && "object" == typeof xt.urls) {
            var e = xt.urls[nt.getType()];
            if (e) return e
        }
        return xt.url
    }, this.getTransport = function() {
        return nt
    }, this.getConfiguration = function() {
        return this._mixin(!0, {}, xt)
    }, this.getAdvice = function() {
        return this._mixin(!0, {}, bt)
    }, org.cometd.WebSocket = window.WebSocket, org.cometd.WebSocket || (org.cometd.WebSocket = window.MozWebSocket)
},
    function() {
        function e(e) {
            return e.AckExtension = function() {
                function e(e, n) {
                    t._debug(e, n)
                }
                var t, n = !1,
                    r = -1;
                this.registered = function(n, r) {
                    t = r, e("AckExtension: executing registration callback")
                }, this.unregistered = function() {
                    e("AckExtension: executing unregistration callback"), t = null
                }, this.incoming = function(t) {
                    var i = t.channel;
                    if ("/meta/handshake" == i) n = t.ext && t.ext.ack, e("AckExtension: server supports acks", n);
                    else if ("/meta/connect" == i && t.successful && n) {
                        var o = t.ext;
                        o && "number" == typeof o.ack && (r = o.ack, e("AckExtension: server sent ack id", r))
                    }
                    return t
                }, this.outgoing = function(i) {
                    var o = i.channel;
                    return "/meta/handshake" == o ? (i.ext || (i.ext = {}), i.ext.ack = t && t.ackEnabled !== !1, r = -1) : "/meta/connect" == o && n && (i.ext || (i.ext = {}), i.ext.ack = r, e("AckExtension: client sending ack id", r)), i
                }
            }
        }
        "function" == typeof define && define.amd ? define(["org/cometd"], e) : e(org.cometd)
    }(),
    function() {
        function e(e) {
            return e.TimeSyncExtension = function(t) {
                function n(e, t) {
                    r._debug(e, t)
                }
                var r, i = t && t.maxSamples || 10,
                    o = [],
                    a = [],
                    s = 0,
                    c = 0;
                this.registered = function(e, t) {
                    r = t, n("TimeSyncExtension: executing registration callback")
                }, this.unregistered = function() {
                    n("TimeSyncExtension: executing unregistration callback"), r = null, o = [], a = []
                }, this.incoming = function(e) {
                    var t = e.channel;
                    if (t && 0 === t.indexOf("/meta/") && e.ext && e.ext.timesync) {
                        var r = e.ext.timesync;
                        n("TimeSyncExtension: server sent timesync", r);
                        var l = (new Date).getTime(),
                            u = (l - r.tc - r.p) / 2,
                            d = r.ts - r.tc - u;
                        o.push(u), a.push(d), a.length > i && (a.shift(), o.shift());
                        for (var f = a.length, p = 0, h = 0, g = 0; f > g; ++g) p += o[g], h += a[g];
                        s = parseInt((p / f).toFixed()), c = parseInt((h / f).toFixed()), n("TimeSyncExtension: network lag", s, "ms, time offset with server", c, "ms", s, c)
                    }
                    return e
                }, this.outgoing = function(t) {
                    var r = t.channel;
                    return r && 0 === r.indexOf("/meta/") && (t.ext || (t.ext = {}), t.ext.timesync = {
                        tc: (new Date).getTime(),
                        l: s,
                        o: c
                    }, n("TimeSyncExtension: client sending timesync", e.JSON.toJSON(t.ext.timesync))), t
                }, this.getTimeOffset = function() {
                    return c
                }, this.getTimeOffsetSamples = function() {
                    return a
                }, this.getNetworkLag = function() {
                    return s
                }, this.getServerTime = function() {
                    return (new Date).getTime() + c
                }, this.getServerDate = function() {
                    return new Date(this.getServerTime())
                }, this.setTimeout = function(t, n) {
                    var i = n instanceof Date ? n.getTime() : 0 + n,
                        o = i - c,
                        a = o - (new Date).getTime();
                    return 0 >= a && (a = 1), e.Utils.setTimeout(r, t, a)
                }
            }
        }
        "function" == typeof define && define.amd ? define(["org/cometd"], e) : e(org.cometd)
    }(),
    function(e, t, n) {
        "use strict";
        t.module("ngCookies", ["ng"]).factory("$cookies", ["$rootScope", "$browser",
            function(e, r) {
                function i() {
                    var e, i, o, c;
                    for (e in s) u(a[e]) && r.cookies(e, n);
                    for (e in a) i = a[e], t.isString(i) || (i = "" + i, a[e] = i), i !== s[e] && (r.cookies(e, i), c = !0);
                    if (c) {
                        c = !1, o = r.cookies();
                        for (e in a) a[e] !== o[e] && (u(o[e]) ? delete a[e] : a[e] = o[e], c = !0)
                    }
                }
                var o, a = {}, s = {}, c = !1,
                    l = t.copy,
                    u = t.isUndefined;
                return r.addPollFn(function() {
                    var t = r.cookies();
                    o != t && (o = t, l(t, s), l(t, a), c && e.$apply())
                })(), c = !0, e.$watch(i), a
            }
        ]).factory("$cookieStore", ["$cookies",
            function(e) {
                return {
                    get: function(n) {
                        var r = e[n];
                        return r ? t.fromJson(r) : r
                    },
                    put: function(n, r) {
                        e[n] = t.toJson(r)
                    },
                    remove: function(t) {
                        delete e[t]
                    }
                }
            }
        ])
    }(window, window.angular),
    function(e, t, n) {
        "use strict";

        function r(e) {
            return null != e && "" !== e && "hasOwnProperty" !== e && s.test("." + e)
        }

        function i(e, t) {
            if (!r(t)) throw a("badmember", 'Dotted member path "@{0}" is invalid.', t);
            for (var i = t.split("."), o = 0, s = i.length; s > o && e !== n; o++) {
                var c = i[o];
                e = null !== e ? e[c] : n
            }
            return e
        }

        function o(e, n) {
            n = n || {}, t.forEach(n, function(e, t) {
                delete n[t]
            });
            for (var r in e)!e.hasOwnProperty(r) || "$" === r.charAt(0) && "$" === r.charAt(1) || (n[r] = e[r]);
            return n
        }
        var a = t.$$minErr("$resource"),
            s = /^(\.[a-zA-Z_$][0-9a-zA-Z_$]*)+$/;
        t.module("ngResource", ["ng"]).factory("$resource", ["$http", "$q",
            function(e, r) {
                function s(e) {
                    return c(e, !0).replace(/%26/gi, "&").replace(/%3D/gi, "=").replace(/%2B/gi, "+")
                }

                function c(e, t) {
                    return encodeURIComponent(e).replace(/%40/gi, "@").replace(/%3A/gi, ":").replace(/%24/g, "$").replace(/%2C/gi, ",").replace(/%20/g, t ? "%20" : "+")
                }

                function l(e, t) {
                    this.template = e, this.defaults = t || {}, this.urlParams = {}
                }

                function u(s, c, v) {
                    function y(e, t) {
                        var n = {};
                        return t = h({}, c, t), p(t, function(t, r) {
                            m(t) && (t = t()), n[r] = t && t.charAt && "@" == t.charAt(0) ? i(e, t.substr(1)) : t
                        }), n
                    }

                    function b(e) {
                        return e.resource
                    }

                    function $(e) {
                        o(e || {}, this)
                    }
                    var w = new l(s);
                    return v = h({}, d, v), p(v, function(i, s) {
                        var c = /^(POST|PUT|PATCH)$/i.test(i.method);
                        $[s] = function(s, l, u, d) {
                            var v, k, x, T = {};
                            switch (arguments.length) {
                                case 4:
                                    x = d, k = u;
                                case 3:
                                case 2:
                                    if (!m(l)) {
                                        T = s, v = l, k = u;
                                        break
                                    }
                                    if (m(s)) {
                                        k = s, x = l;
                                        break
                                    }
                                    k = l, x = u;
                                case 1:
                                    m(s) ? k = s : c ? v = s : T = s;
                                    break;
                                case 0:
                                    break;
                                default:
                                    throw a("badargs", "Expected up to 4 arguments [params, data, success, error], got {0} arguments", arguments.length)
                            }
                            var C = this instanceof $,
                                S = C ? v : i.isArray ? [] : new $(v),
                                A = {}, E = i.interceptor && i.interceptor.response || b,
                                N = i.interceptor && i.interceptor.responseError || n;
                            p(i, function(e, t) {
                                "params" != t && "isArray" != t && "interceptor" != t && (A[t] = g(e))
                            }), c && (A.data = v), w.setUrlParams(A, h({}, y(v, i.params || {}), T), i.url);
                            var j = e(A).then(function(e) {
                                var n = e.data,
                                    r = S.$promise;
                                if (n) {
                                    if (t.isArray(n) !== !! i.isArray) throw a("badcfg", "Error in resource configuration. Expected response to contain an {0} but got an {1}", i.isArray ? "array" : "object", t.isArray(n) ? "array" : "object");
                                    i.isArray ? (S.length = 0, p(n, function(e) {
                                        S.push(new $(e))
                                    })) : (o(n, S), S.$promise = r)
                                }
                                return S.$resolved = !0, e.resource = S, e
                            }, function(e) {
                                return S.$resolved = !0, (x || f)(e), r.reject(e)
                            });
                            return j = j.then(function(e) {
                                var t = E(e);
                                return (k || f)(t, e.headers), t
                            }, N), C ? j : (S.$promise = j, S.$resolved = !1, S)
                        }, $.prototype["$" + s] = function(e, t, n) {
                            m(e) && (n = t, t = e, e = {});
                            var r = $[s].call(this, e, this, t, n);
                            return r.$promise || r
                        }
                    }), $.bind = function(e) {
                        return u(s, h({}, c, e), v)
                    }, $
                }
                var d = {
                        get: {
                            method: "GET"
                        },
                        save: {
                            method: "POST"
                        },
                        query: {
                            method: "GET",
                            isArray: !0
                        },
                        remove: {
                            method: "DELETE"
                        },
                        "delete": {
                            method: "DELETE"
                        }
                    }, f = t.noop,
                    p = t.forEach,
                    h = t.extend,
                    g = t.copy,
                    m = t.isFunction;
                return l.prototype = {
                    setUrlParams: function(e, n, r) {
                        var i, o, c = this,
                            l = r || c.template,
                            u = c.urlParams = {};
                        p(l.split(/\W/), function(e) {
                            if ("hasOwnProperty" === e) throw a("badname", "hasOwnProperty is not a valid parameter name.");
                            !new RegExp("^\\d+$").test(e) && e && new RegExp("(^|[^\\\\]):" + e + "(\\W|$)").test(l) && (u[e] = !0)
                        }), l = l.replace(/\\:/g, ":"), n = n || {}, p(c.urlParams, function(e, r) {
                            i = n.hasOwnProperty(r) ? n[r] : c.defaults[r], t.isDefined(i) && null !== i ? (o = s(i), l = l.replace(new RegExp(":" + r + "(\\W|$)", "g"), function(e, t) {
                                return o + t
                            })) : l = l.replace(new RegExp("(/?):" + r + "(\\W|$)", "g"), function(e, t, n) {
                                return "/" == n.charAt(0) ? n : t + n
                            })
                        }), l = l.replace(/\/+$/, "") || "/", l = l.replace(/\/\.(?=\w+($|\?))/, "."), e.url = l.replace(/\/\\\./, "/."), p(n, function(t, n) {
                            c.urlParams[n] || (e.params = e.params || {}, e.params[n] = t)
                        })
                    }
                }, u
            }
        ])
    }(window, window.angular),
    function(e, t) {
        "use strict";

        function n() {
            function e(e, n) {
                return t.extend(new(t.extend(function() {}, {
                    prototype: e
                })), n)
            }

            function n(e, t) {
                var n = t.caseInsensitiveMatch,
                    r = {
                        originalPath: e,
                        regexp: e
                    }, i = r.keys = [];
                return e = e.replace(/([().])/g, "\\$1").replace(/(\/)?:(\w+)([\?\*])?/g, function(e, t, n, r) {
                    var o = "?" === r ? r : null,
                        a = "*" === r ? r : null;
                    return i.push({
                        name: n,
                        optional: !! o
                    }), t = t || "", "" + (o ? "" : t) + "(?:" + (o ? t : "") + (a && "(.+?)" || "([^/]+)") + (o || "") + ")" + (o || "")
                }).replace(/([\/$\*])/g, "\\$1"), r.regexp = new RegExp("^" + e + "$", n ? "i" : ""), r
            }
            var r = {};
            this.when = function(e, i) {
                if (r[e] = t.extend({
                    reloadOnSearch: !0
                }, i, e && n(e, i)), e) {
                    var o = "/" == e[e.length - 1] ? e.substr(0, e.length - 1) : e + "/";
                    r[o] = t.extend({
                        redirectTo: e
                    }, n(o, i))
                }
                return this
            }, this.otherwise = function(e) {
                return this.when(null, e), this
            }, this.$get = ["$rootScope", "$location", "$routeParams", "$q", "$injector", "$http", "$templateCache", "$sce",
                function(n, i, o, a, s, c, l, u) {
                    function d(e, t) {
                        var n = t.keys,
                            r = {};
                        if (!t.regexp) return null;
                        var i = t.regexp.exec(e);
                        if (!i) return null;
                        for (var o = 1, a = i.length; a > o; ++o) {
                            var s = n[o - 1],
                                c = "string" == typeof i[o] ? decodeURIComponent(i[o]) : i[o];
                            s && c && (r[s.name] = c)
                        }
                        return r
                    }

                    function f() {
                        var e = p(),
                            r = m.current;
                        e && r && e.$$route === r.$$route && t.equals(e.pathParams, r.pathParams) && !e.reloadOnSearch && !g ? (r.params = e.params, t.copy(r.params, o), n.$broadcast("$routeUpdate", r)) : (e || r) && (g = !1, n.$broadcast("$routeChangeStart", e, r), m.current = e, e && e.redirectTo && (t.isString(e.redirectTo) ? i.path(h(e.redirectTo, e.params)).search(e.params).replace() : i.url(e.redirectTo(e.pathParams, i.path(), i.search())).replace()), a.when(e).then(function() {
                            if (e) {
                                var n, r, i = t.extend({}, e.resolve);
                                return t.forEach(i, function(e, n) {
                                    i[n] = t.isString(e) ? s.get(e) : s.invoke(e)
                                }), t.isDefined(n = e.template) ? t.isFunction(n) && (n = n(e.params)) : t.isDefined(r = e.templateUrl) && (t.isFunction(r) && (r = r(e.params)), r = u.getTrustedResourceUrl(r), t.isDefined(r) && (e.loadedTemplateUrl = r, n = c.get(r, {
                                    cache: l
                                }).then(function(e) {
                                    return e.data
                                }))), t.isDefined(n) && (i.$template = n), a.all(i)
                            }
                        }).then(function(i) {
                            e == m.current && (e && (e.locals = i, t.copy(e.params, o)), n.$broadcast("$routeChangeSuccess", e, r))
                        }, function(t) {
                            e == m.current && n.$broadcast("$routeChangeError", e, r, t)
                        }))
                    }

                    function p() {
                        var n, o;
                        return t.forEach(r, function(r) {
                            !o && (n = d(i.path(), r)) && (o = e(r, {
                                params: t.extend({}, i.search(), n),
                                pathParams: n
                            }), o.$$route = r)
                        }), o || r[null] && e(r[null], {
                            params: {},
                            pathParams: {}
                        })
                    }

                    function h(e, n) {
                        var r = [];
                        return t.forEach((e || "").split(":"), function(e, t) {
                            if (0 === t) r.push(e);
                            else {
                                var i = e.match(/(\w+)(.*)/),
                                    o = i[1];
                                r.push(n[o]), r.push(i[2] || ""), delete n[o]
                            }
                        }), r.join("")
                    }
                    var g = !1,
                        m = {
                            routes: r,
                            reload: function() {
                                g = !0, n.$evalAsync(f)
                            }
                        };
                    return n.$on("$locationChangeSuccess", f), m
                }
            ]
        }

        function r() {
            this.$get = function() {
                return {}
            }
        }

        function i(e, n, r) {
            return {
                restrict: "ECA",
                terminal: !0,
                priority: 400,
                transclude: "element",
                link: function(i, o, a, s, c) {
                    function l() {
                        p && (p.remove(), p = null), d && (d.$destroy(), d = null), f && (r.leave(f, function() {
                            p = null
                        }), p = f, f = null)
                    }

                    function u() {
                        var a = e.current && e.current.locals,
                            s = a && a.$template;
                        if (t.isDefined(s)) {
                            var u = i.$new(),
                                p = e.current,
                                m = c(u, function(e) {
                                    r.enter(e, null, f || o, function() {
                                        !t.isDefined(h) || h && !i.$eval(h) || n()
                                    }), l()
                                });
                            f = m, d = p.scope = u, d.$emit("$viewContentLoaded"), d.$eval(g)
                        } else l()
                    }
                    var d, f, p, h = a.autoscroll,
                        g = a.onload || "";
                    i.$on("$routeChangeSuccess", u), u()
                }
            }
        }

        function o(e, t, n) {
            return {
                restrict: "ECA",
                priority: -400,
                link: function(r, i) {
                    var o = n.current,
                        a = o.locals;
                    i.html(a.$template);
                    var s = e(i.contents());
                    if (o.controller) {
                        a.$scope = r;
                        var c = t(o.controller, a);
                        o.controllerAs && (r[o.controllerAs] = c), i.data("$ngControllerController", c), i.children().data("$ngControllerController", c)
                    }
                    s(r)
                }
            }
        }
        var a = t.module("ngRoute", ["ng"]).provider("$route", n);
        a.provider("$routeParams", r), a.directive("ngView", i), a.directive("ngView", o), i.$inject = ["$route", "$anchorScroll", "$animate"], o.$inject = ["$compile", "$controller", "$route"]
    }(window, window.angular),
    function(e, t) {
        "use strict";

        function n() {
            this.$get = ["$$sanitizeUri",
                function(e) {
                    return function(t) {
                        var n = [];
                        return o(t, c(n, function(t, n) {
                            return !/^unsafe/.test(e(t, n))
                        })), n.join("")
                    }
                }
            ]
        }

        function r(e) {
            var n = [],
                r = c(n, t.noop);
            return r.chars(e), n.join("")
        }

        function i(e) {
            var t, n = {}, r = e.split(",");
            for (t = 0; t < r.length; t++) n[r[t]] = !0;
            return n
        }

        function o(e, n) {
            function r(e, r, o, s) {
                if (r = t.lowercase(r), x[r])
                    for (; y.last() && T[y.last()];) i("", y.last());
                k[r] && y.last() == r && i("", r), s = b[r] || !! s, s || y.push(r);
                var c = {};
                o.replace(f, function(e, t, n, r, i) {
                    var o = n || r || i || "";
                    c[t] = a(o)
                }), n.start && n.start(r, c, s)
            }

            function i(e, r) {
                var i, o = 0;
                if (r = t.lowercase(r))
                    for (o = y.length - 1; o >= 0 && y[o] != r; o--);
                if (o >= 0) {
                    for (i = y.length - 1; i >= o; i--) n.end && n.end(y[i]);
                    y.length = o
                }
            }
            var o, s, c, y = [],
                $ = e;
            for (y.last = function() {
                return y[y.length - 1]
            }; e;) {
                if (s = !0, y.last() && C[y.last()]) e = e.replace(new RegExp("(.*)<\\s*\\/\\s*" + y.last() + "[^>]*>", "i"), function(e, t) {
                    return t = t.replace(g, "$1").replace(v, "$1"), n.chars && n.chars(a(t)), ""
                }), i("", y.last());
                else if (0 === e.indexOf("<!--") ? (o = e.indexOf("--", 4), o >= 0 && e.lastIndexOf("-->", o) === o && (n.comment && n.comment(e.substring(4, o)), e = e.substring(o + 3), s = !1)) : m.test(e) ? (c = e.match(m), c && (e = e.replace(c[0], ""), s = !1)) : h.test(e) ? (c = e.match(d), c && (e = e.substring(c[0].length), c[0].replace(d, i), s = !1)) : p.test(e) && (c = e.match(u), c && (e = e.substring(c[0].length), c[0].replace(u, r), s = !1)), s) {
                    o = e.indexOf("<");
                    var w = 0 > o ? e : e.substring(0, o);
                    e = 0 > o ? "" : e.substring(o), n.chars && n.chars(a(w))
                }
                if (e == $) throw l("badparse", "The sanitizer was unable to parse the following block of html: {0}", e);
                $ = e
            }
            i()
        }

        function a(e) {
            if (!e) return "";
            var t = j.exec(e),
                n = t[1],
                r = t[3],
                i = t[2];
            return i && (N.innerHTML = i.replace(/</g, "&lt;"), i = "textContent" in N ? N.textContent : N.innerText), n + i + r
        }

        function s(e) {
            return e.replace(/&/g, "&amp;").replace(y, function(e) {
                return "&#" + e.charCodeAt(0) + ";"
            }).replace(/</g, "&lt;").replace(/>/g, "&gt;")
        }

        function c(e, n) {
            var r = !1,
                i = t.bind(e, e.push);
            return {
                start: function(e, o, a) {
                    e = t.lowercase(e), !r && C[e] && (r = e), r || S[e] !== !0 || (i("<"), i(e), t.forEach(o, function(r, o) {
                        var a = t.lowercase(o),
                            c = "img" === e && "src" === a || "background" === a;
                        E[a] !== !0 || A[a] === !0 && !n(r, c) || (i(" "), i(o), i('="'), i(s(r)), i('"'))
                    }), i(a ? "/>" : ">"))
                },
                end: function(e) {
                    e = t.lowercase(e), r || S[e] !== !0 || (i("</"), i(e), i(">")), e == r && (r = !1)
                },
                chars: function(e) {
                    r || i(s(e))
                }
            }
        }
        var l = t.$$minErr("$sanitize"),
            u = /^<\s*([\w:-]+)((?:\s+[\w:-]+(?:\s*=\s*(?:(?:"[^"]*")|(?:'[^']*')|[^>\s]+))?)*)\s*(\/?)\s*>/,
            d = /^<\s*\/\s*([\w:-]+)[^>]*>/,
            f = /([\w:-]+)(?:\s*=\s*(?:(?:"((?:[^"])*)")|(?:'((?:[^'])*)')|([^>\s]+)))?/g,
            p = /^</,
            h = /^<\s*\//,
            g = /<!--(.*?)-->/g,
            m = /<!DOCTYPE([^>]*?)>/i,
            v = /<!\[CDATA\[(.*?)]]>/g,
            y = /([^\#-~| |!])/g,
            b = i("area,br,col,hr,img,wbr"),
            $ = i("colgroup,dd,dt,li,p,tbody,td,tfoot,th,thead,tr"),
            w = i("rp,rt"),
            k = t.extend({}, w, $),
            x = t.extend({}, $, i("address,article,aside,blockquote,caption,center,del,dir,div,dl,figure,figcaption,footer,h1,h2,h3,h4,h5,h6,header,hgroup,hr,ins,map,menu,nav,ol,pre,script,section,table,ul")),
            T = t.extend({}, w, i("a,abbr,acronym,b,bdi,bdo,big,br,cite,code,del,dfn,em,font,i,img,ins,kbd,label,map,mark,q,ruby,rp,rt,s,samp,small,span,strike,strong,sub,sup,time,tt,u,var")),
            C = i("script,style"),
            S = t.extend({}, b, x, T, k),
            A = i("background,cite,href,longdesc,src,usemap"),
            E = t.extend({}, A, i("abbr,align,alt,axis,bgcolor,border,cellpadding,cellspacing,class,clear,color,cols,colspan,compact,coords,dir,face,headers,height,hreflang,hspace,ismap,lang,language,nohref,nowrap,rel,rev,rows,rowspan,rules,scope,scrolling,shape,size,span,start,summary,target,title,type,valign,value,vspace,width")),
            N = document.createElement("pre"),
            j = /^(\s*)([\s\S]*?)(\s*)$/;
        t.module("ngSanitize", []).provider("$sanitize", n), t.module("ngSanitize").filter("linky", ["$sanitize",
            function(e) {
                var n = /((ftp|https?):\/\/|(mailto:)?[A-Za-z0-9._%+-]+@)\S*[^\s.;,(){}<>]/,
                    i = /^mailto:/;
                return function(o, a) {
                    function s(e) {
                        e && p.push(r(e))
                    }

                    function c(e, n) {
                        p.push("<a "), t.isDefined(a) && (p.push('target="'), p.push(a), p.push('" ')), p.push('href="'), p.push(e), p.push('">'), s(n), p.push("</a>")
                    }
                    if (!o) return o;
                    for (var l, u, d, f = o, p = []; l = f.match(n);) u = l[0], l[2] == l[3] && (u = "mailto:" + u), d = l.index, s(f.substr(0, d)), c(u, l[0].replace(i, "")), f = f.substring(d + l[0].length);
                    return s(f), e(p.join(""))
                }
            }
        ])
    }(window, window.angular),
    function(e, t, n) {
        function r(e) {
            var t = {}, r = /^jQuery\d+$/;
            return n.each(e.attributes, function(e, n) {
                n.specified && !r.test(n.name) && (t[n.name] = n.value)
            }), t
        }

        function i(e, r) {
            var i = this,
                o = n(i);
            if (i.value == o.attr("placeholder") && o.hasClass("placeholder"))
                if (o.data("placeholder-password")) {
                    if (o = o.hide().next().show().attr("id", o.removeAttr("id").data("placeholder-id")), e === !0) return o[0].value = r;
                    o.focus()
                } else i.value = "", o.removeClass("placeholder"), i == t.activeElement && i.select()
        }

        function o() {
            var e, t = this,
                o = n(t),
                a = this.id;
            if ("" == t.value) {
                if ("password" == t.type) {
                    if (!o.data("placeholder-textinput")) {
                        try {
                            e = o.clone().attr({
                                type: "text"
                            })
                        } catch (s) {
                            e = n("<input>").attr(n.extend(r(this), {
                                type: "text"
                            }))
                        }
                        e.removeAttr("name").data({
                            "placeholder-password": !0,
                            "placeholder-id": a
                        }).bind("focus.placeholder", i), o.data({
                            "placeholder-textinput": e,
                            "placeholder-id": a
                        }).before(e)
                    }
                    o = o.removeAttr("id").hide().prev().attr("id", a).show()
                }
                o.addClass("placeholder"), o[0].value = o.attr("placeholder")
            } else o.removeClass("placeholder")
        }
        var a, s, c = "placeholder" in t.createElement("input"),
            l = "placeholder" in t.createElement("textarea"),
            u = n.fn,
            d = n.valHooks;
        c && l ? (s = u.placeholder = function() {
            return this
        }, s.input = s.textarea = !0) : (s = u.placeholder = function() {
            var e = this;
            return e.filter((c ? "textarea" : ":input") + "[placeholder]").not(".placeholder").bind({
                "focus.placeholder": i,
                "blur.placeholder": o
            }).data("placeholder-enabled", !0).trigger("blur.placeholder"), e
        }, s.input = c, s.textarea = l, a = {
            get: function(e) {
                var t = n(e);
                return t.data("placeholder-enabled") && t.hasClass("placeholder") ? "" : e.value
            },
            set: function(e, r) {
                var a = n(e);
                return a.data("placeholder-enabled") ? ("" == r ? (e.value = r, e != t.activeElement && o.call(e)) : a.hasClass("placeholder") ? i.call(e, !0, r) || (e.value = r) : e.value = r, a) : e.value = r
            }
        }, c || (d.input = a), l || (d.textarea = a), n(function() {
            n(t).delegate("form", "submit.placeholder", function() {
                var e = n(".placeholder", this).each(i);
                setTimeout(function() {
                    e.each(o)
                }, 10)
            })
        }), n(e).bind("beforeunload.placeholder", function() {
            n(".placeholder").each(function() {
                this.value = ""
            })
        }))
    }(this, document, jQuery), window.Modernizr = function(e, t, n) {
    function r(e) {
        b.cssText = e
    }

    function i(e, t) {
        return r(x.join(e + ";") + (t || ""))
    }

    function o(e, t) {
        return typeof e === t
    }

    function a(e, t) {
        return !!~("" + e).indexOf(t)
    }

    function s(e, t) {
        for (var r in e) {
            var i = e[r];
            if (!a(i, "-") && b[i] !== n) return "pfx" == t ? i : !0
        }
        return !1
    }

    function c(e, t, r) {
        for (var i in e) {
            var a = t[e[i]];
            if (a !== n) return r === !1 ? e[i] : o(a, "function") ? a.bind(r || t) : a
        }
        return !1
    }

    function l(e, t, n) {
        var r = e.charAt(0).toUpperCase() + e.slice(1),
            i = (e + " " + C.join(r + " ") + r).split(" ");
        return o(t, "string") || o(t, "undefined") ? s(i, t) : (i = (e + " " + S.join(r + " ") + r).split(" "), c(i, t, n))
    }

    function u() {
        h.input = function(n) {
            for (var r = 0, i = n.length; i > r; r++) j[n[r]] = n[r] in $;
            return j.list && (j.list = !! t.createElement("datalist") && !! e.HTMLDataListElement), j
        }("autocomplete autofocus list placeholder max min multiple pattern required step".split(" ")), h.inputtypes = function(e) {
            for (var r, i, o, a = 0, s = e.length; s > a; a++) $.setAttribute("type", i = e[a]), r = "text" !== $.type, r && ($.value = w, $.style.cssText = "position:absolute;visibility:hidden;", /^range$/.test(i) && $.style.WebkitAppearance !== n ? (m.appendChild($), o = t.defaultView, r = o.getComputedStyle && "textfield" !== o.getComputedStyle($, null).WebkitAppearance && 0 !== $.offsetHeight, m.removeChild($)) : /^(search|tel)$/.test(i) || (r = /^(url|email)$/.test(i) ? $.checkValidity && $.checkValidity() === !1 : $.value != w)), N[e[a]] = !! r;
            return N
        }("search tel url email datetime date month week time datetime-local number range color".split(" "))
    }
    var d, f, p = "2.6.2",
        h = {}, g = !0,
        m = t.documentElement,
        v = "modernizr",
        y = t.createElement(v),
        b = y.style,
        $ = t.createElement("input"),
        w = ":)",
        k = {}.toString,
        x = " -webkit- -moz- -o- -ms- ".split(" "),
        T = "Webkit Moz O ms",
        C = T.split(" "),
        S = T.toLowerCase().split(" "),
        A = {
            svg: "http://www.w3.org/2000/svg"
        }, E = {}, N = {}, j = {}, _ = [],
        q = _.slice,
        M = function(e, n, r, i) {
            var o, a, s, c, l = t.createElement("div"),
                u = t.body,
                d = u || t.createElement("body");
            if (parseInt(r, 10))
                for (; r--;) s = t.createElement("div"), s.id = i ? i[r] : v + (r + 1), l.appendChild(s);
            return o = ["&#173;", '<style id="s', v, '">', e, "</style>"].join(""), l.id = v, (u ? l : d).innerHTML += o, d.appendChild(l), u || (d.style.background = "", d.style.overflow = "hidden", c = m.style.overflow, m.style.overflow = "hidden", m.appendChild(d)), a = n(l, e), u ? l.parentNode.removeChild(l) : (d.parentNode.removeChild(d), m.style.overflow = c), !! a
        }, O = function(t) {
            var n = e.matchMedia || e.msMatchMedia;
            if (n) return n(t).matches;
            var r;
            return M("@media " + t + " { #" + v + " { position: absolute; } }", function(t) {
                r = "absolute" == (e.getComputedStyle ? getComputedStyle(t, null) : t.currentStyle).position
            }), r
        }, I = function() {
            function e(e, i) {
                i = i || t.createElement(r[e] || "div"), e = "on" + e;
                var a = e in i;
                return a || (i.setAttribute || (i = t.createElement("div")), i.setAttribute && i.removeAttribute && (i.setAttribute(e, ""), a = o(i[e], "function"), o(i[e], "undefined") || (i[e] = n), i.removeAttribute(e))), i = null, a
            }
            var r = {
                select: "input",
                change: "input",
                submit: "form",
                reset: "form",
                error: "img",
                load: "img",
                abort: "img"
            };
            return e
        }(),
        D = {}.hasOwnProperty;
    f = o(D, "undefined") || o(D.call, "undefined") ? function(e, t) {
        return t in e && o(e.constructor.prototype[t], "undefined")
    } : function(e, t) {
        return D.call(e, t)
    }, Function.prototype.bind || (Function.prototype.bind = function(e) {
        var t = this;
        if ("function" != typeof t) throw new TypeError;
        var n = q.call(arguments, 1),
            r = function() {
                if (this instanceof r) {
                    var i = function() {};
                    i.prototype = t.prototype;
                    var o = new i,
                        a = t.apply(o, n.concat(q.call(arguments)));
                    return Object(a) === a ? a : o
                }
                return t.apply(e, n.concat(q.call(arguments)))
            };
        return r
    }), E.flexbox = function() {
        return l("flexWrap")
    }, E.canvas = function() {
        var e = t.createElement("canvas");
        return !!e.getContext && !! e.getContext("2d")
    }, E.canvastext = function() {
        return !!h.canvas && !! o(t.createElement("canvas").getContext("2d").fillText, "function")
    }, E.webgl = function() {
        return !!e.WebGLRenderingContext
    }, E.touch = function() {
        var n;
        return "ontouchstart" in e || e.DocumentTouch && t instanceof DocumentTouch ? n = !0 : M(["@media (", x.join("touch-enabled),("), v, ")", "{#modernizr{top:9px;position:absolute}}"].join(""), function(e) {
            n = 9 === e.offsetTop
        }), n
    }, E.geolocation = function() {
        return "geolocation" in navigator
    }, E.postmessage = function() {
        return !!e.postMessage
    }, E.websqldatabase = function() {
        return !!e.openDatabase
    }, E.indexedDB = function() {
        return !!l("indexedDB", e)
    }, E.hashchange = function() {
        return I("hashchange", e) && (t.documentMode === n || t.documentMode > 7)
    }, E.history = function() {
        return !!e.history && !! history.pushState
    }, E.draganddrop = function() {
        var e = t.createElement("div");
        return "draggable" in e || "ondragstart" in e && "ondrop" in e
    }, E.websockets = function() {
        return "WebSocket" in e || "MozWebSocket" in e
    }, E.rgba = function() {
        return r("background-color:rgba(150,255,150,.5)"), a(b.backgroundColor, "rgba")
    }, E.hsla = function() {
        return r("background-color:hsla(120,40%,100%,.5)"), a(b.backgroundColor, "rgba") || a(b.backgroundColor, "hsla")
    }, E.multiplebgs = function() {
        return r("background:url(https://),url(https://),red url(https://)"), /(url\s*\(.*?){3}/.test(b.background)
    }, E.backgroundsize = function() {
        return l("backgroundSize")
    }, E.borderimage = function() {
        return l("borderImage")
    }, E.borderradius = function() {
        return l("borderRadius")
    }, E.boxshadow = function() {
        return l("boxShadow")
    }, E.textshadow = function() {
        return "" === t.createElement("div").style.textShadow
    }, E.opacity = function() {
        return i("opacity:.55"), /^0.55$/.test(b.opacity)
    }, E.cssanimations = function() {
        return l("animationName")
    }, E.csscolumns = function() {
        return l("columnCount")
    }, E.cssgradients = function() {
        var e = "background-image:",
            t = "gradient(linear,left top,right bottom,from(#9f9),to(white));",
            n = "linear-gradient(left top,#9f9, white);";
        return r((e + "-webkit- ".split(" ").join(t + e) + x.join(n + e)).slice(0, -e.length)), a(b.backgroundImage, "gradient")
    }, E.cssreflections = function() {
        return l("boxReflect")
    }, E.csstransforms = function() {
        return !!l("transform")
    }, E.csstransforms3d = function() {
        var e = !! l("perspective");
        return e && "webkitPerspective" in m.style && M("@media (transform-3d),(-webkit-transform-3d){#modernizr{left:9px;position:absolute;height:3px;}}", function(t) {
            e = 9 === t.offsetLeft && 3 === t.offsetHeight
        }), e
    }, E.csstransitions = function() {
        return l("transition")
    }, E.fontface = function() {
        var e;
        return M('@font-face {font-family:"font";src:url("https://")}', function(n, r) {
            var i = t.getElementById("smodernizr"),
                o = i.sheet || i.styleSheet,
                a = o ? o.cssRules && o.cssRules[0] ? o.cssRules[0].cssText : o.cssText || "" : "";
            e = /src/i.test(a) && 0 === a.indexOf(r.split(" ")[0])
        }), e
    }, E.generatedcontent = function() {
        var e;
        return M(["#", v, "{font:0/0 a}#", v, ':after{content:"', w, '";visibility:hidden;font:3px/1 a}'].join(""), function(t) {
            e = t.offsetHeight >= 3
        }), e
    }, E.video = function() {
        var e = t.createElement("video"),
            n = !1;
        try {
            (n = !! e.canPlayType) && (n = new Boolean(n), n.ogg = e.canPlayType('video/ogg; codecs="theora"').replace(/^no$/, ""), n.h264 = e.canPlayType('video/mp4; codecs="avc1.42E01E"').replace(/^no$/, ""), n.webm = e.canPlayType('video/webm; codecs="vp8, vorbis"').replace(/^no$/, ""))
        } catch (r) {}
        return n
    }, E.audio = function() {
        var e = t.createElement("audio"),
            n = !1;
        try {
            (n = !! e.canPlayType) && (n = new Boolean(n), n.ogg = e.canPlayType('audio/ogg; codecs="vorbis"').replace(/^no$/, ""), n.mp3 = e.canPlayType("audio/mpeg;").replace(/^no$/, ""), n.wav = e.canPlayType('audio/wav; codecs="1"').replace(/^no$/, ""), n.m4a = (e.canPlayType("audio/x-m4a;") || e.canPlayType("audio/aac;")).replace(/^no$/, ""))
        } catch (r) {}
        return n
    }, E.localstorage = function() {
        try {
            return localStorage.setItem(v, v), localStorage.removeItem(v), !0
        } catch (e) {
            return !1
        }
    }, E.sessionstorage = function() {
        try {
            return sessionStorage.setItem(v, v), sessionStorage.removeItem(v), !0
        } catch (e) {
            return !1
        }
    }, E.webworkers = function() {
        return !!e.Worker
    }, E.applicationcache = function() {
        return !!e.applicationCache
    }, E.svg = function() {
        return !!t.createElementNS && !! t.createElementNS(A.svg, "svg").createSVGRect
    }, E.inlinesvg = function() {
        var e = t.createElement("div");
        return e.innerHTML = "<svg/>", (e.firstChild && e.firstChild.namespaceURI) == A.svg
    }, E.smil = function() {
        return !!t.createElementNS && /SVGAnimate/.test(k.call(t.createElementNS(A.svg, "animate")))
    }, E.svgclippaths = function() {
        return !!t.createElementNS && /SVGClipPath/.test(k.call(t.createElementNS(A.svg, "clipPath")))
    };
    for (var L in E) f(E, L) && (d = L.toLowerCase(), h[d] = E[L](), _.push((h[d] ? "" : "no-") + d));
    return h.input || u(), h.addTest = function(e, t) {
        if ("object" == typeof e)
            for (var r in e) f(e, r) && h.addTest(r, e[r]);
        else {
            if (e = e.toLowerCase(), h[e] !== n) return h;
            t = "function" == typeof t ? t() : t, "undefined" != typeof g && g && (m.className += " " + (t ? "" : "no-") + e), h[e] = t
        }
        return h
    }, r(""), y = $ = null,
        function(e, t) {
            function n(e, t) {
                var n = e.createElement("p"),
                    r = e.getElementsByTagName("head")[0] || e.documentElement;
                return n.innerHTML = "x<style>" + t + "</style>", r.insertBefore(n.lastChild, r.firstChild)
            }

            function r() {
                var e = v.elements;
                return "string" == typeof e ? e.split(" ") : e
            }

            function i(e) {
                var t = m[e[h]];
                return t || (t = {}, g++, e[h] = g, m[g] = t), t
            }

            function o(e, n, r) {
                if (n || (n = t), u) return n.createElement(e);
                r || (r = i(n));
                var o;
                return o = r.cache[e] ? r.cache[e].cloneNode() : p.test(e) ? (r.cache[e] = r.createElem(e)).cloneNode() : r.createElem(e), o.canHaveChildren && !f.test(e) ? r.frag.appendChild(o) : o
            }

            function a(e, n) {
                if (e || (e = t), u) return e.createDocumentFragment();
                n = n || i(e);
                for (var o = n.frag.cloneNode(), a = 0, s = r(), c = s.length; c > a; a++) o.createElement(s[a]);
                return o
            }

            function s(e, t) {
                t.cache || (t.cache = {}, t.createElem = e.createElement, t.createFrag = e.createDocumentFragment, t.frag = t.createFrag()), e.createElement = function(n) {
                    return v.shivMethods ? o(n, e, t) : t.createElem(n)
                }, e.createDocumentFragment = Function("h,f", "return function(){var n=f.cloneNode(),c=n.createElement;h.shivMethods&&(" + r().join().replace(/\w+/g, function(e) {
                    return t.createElem(e), t.frag.createElement(e), 'c("' + e + '")'
                }) + ");return n}")(v, t.frag)
            }

            function c(e) {
                e || (e = t);
                var r = i(e);
                return v.shivCSS && !l && !r.hasCSS && (r.hasCSS = !! n(e, "article,aside,figcaption,figure,footer,header,hgroup,nav,section{display:block}mark{background:#FF0;color:#000}")), u || s(e, r), e
            }
            var l, u, d = e.html5 || {}, f = /^<|^(?:button|map|select|textarea|object|iframe|option|optgroup)$/i,
                p = /^(?:a|b|code|div|fieldset|h1|h2|h3|h4|h5|h6|i|label|li|ol|p|q|span|strong|style|table|tbody|td|th|tr|ul)$/i,
                h = "_html5shiv",
                g = 0,
                m = {};
            ! function() {
                try {
                    var e = t.createElement("a");
                    e.innerHTML = "<xyz></xyz>", l = "hidden" in e, u = 1 == e.childNodes.length || function() {
                        t.createElement("a");
                        var e = t.createDocumentFragment();
                        return "undefined" == typeof e.cloneNode || "undefined" == typeof e.createDocumentFragment || "undefined" == typeof e.createElement
                    }()
                } catch (n) {
                    l = !0, u = !0
                }
            }();
            var v = {
                elements: d.elements || "abbr article aside audio bdi canvas data datalist details figcaption figure footer header hgroup mark meter nav output progress section summary time video",
                shivCSS: d.shivCSS !== !1,
                supportsUnknownElements: u,
                shivMethods: d.shivMethods !== !1,
                type: "default",
                shivDocument: c,
                createElement: o,
                createDocumentFragment: a
            };
            e.html5 = v, c(t)
        }(this, t), h._version = p, h._prefixes = x, h._domPrefixes = S, h._cssomPrefixes = C, h.mq = O, h.hasEvent = I, h.testProp = function(e) {
        return s([e])
    }, h.testAllProps = l, h.testStyles = M, h.prefixed = function(e, t, n) {
        return t ? l(e, t, n) : l(e, "pfx")
    }, m.className = m.className.replace(/(^|\s)no-js(\s|$)/, "$1$2") + (g ? " js " + _.join(" ") : ""), h
}(this, this.document),
    function(e, t, n) {
        function r(e) {
            return "[object Function]" == m.call(e)
        }

        function i(e) {
            return "string" == typeof e
        }

        function o() {}

        function a(e) {
            return !e || "loaded" == e || "complete" == e || "uninitialized" == e
        }

        function s() {
            var e = v.shift();
            y = 1, e ? e.t ? h(function() {
                ("c" == e.t ? f.injectCss : f.injectJs)(e.s, 0, e.a, e.x, e.e, 1)
            }, 0) : (e(), s()) : y = 0
        }

        function c(e, n, r, i, o, c, l) {
            function u(t) {
                if (!p && a(d.readyState) && (b.r = p = 1, !y && s(), d.onload = d.onreadystatechange = null, t)) {
                    "img" != e && h(function() {
                        w.removeChild(d)
                    }, 50);
                    for (var r in S[n]) S[n].hasOwnProperty(r) && S[n][r].onload()
                }
            }
            var l = l || f.errorTimeout,
                d = t.createElement(e),
                p = 0,
                m = 0,
                b = {
                    t: r,
                    s: n,
                    e: o,
                    a: c,
                    x: l
                };
            1 === S[n] && (m = 1, S[n] = []), "object" == e ? d.data = n : (d.src = n, d.type = e), d.width = d.height = "0", d.onerror = d.onload = d.onreadystatechange = function() {
                u.call(this, m)
            }, v.splice(i, 0, b), "img" != e && (m || 2 === S[n] ? (w.insertBefore(d, $ ? null : g), h(u, l)) : S[n].push(d))
        }

        function l(e, t, n, r, o) {
            return y = 0, t = t || "j", i(e) ? c("c" == t ? x : k, e, t, this.i++, n, r, o) : (v.splice(this.i++, 0, e), 1 == v.length && s()), this
        }

        function u() {
            var e = f;
            return e.loader = {
                load: l,
                i: 0
            }, e
        }
        var d, f, p = t.documentElement,
            h = e.setTimeout,
            g = t.getElementsByTagName("script")[0],
            m = {}.toString,
            v = [],
            y = 0,
            b = "MozAppearance" in p.style,
            $ = b && !! t.createRange().compareNode,
            w = $ ? p : g.parentNode,
            p = e.opera && "[object Opera]" == m.call(e.opera),
            p = !! t.attachEvent && !p,
            k = b ? "object" : p ? "script" : "img",
            x = p ? "script" : k,
            T = Array.isArray || function(e) {
                return "[object Array]" == m.call(e)
            }, C = [],
            S = {}, A = {
                timeout: function(e, t) {
                    return t.length && (e.timeout = t[0]), e
                }
            };
        f = function(e) {
            function t(e) {
                var t, n, r, e = e.split("!"),
                    i = C.length,
                    o = e.pop(),
                    a = e.length,
                    o = {
                        url: o,
                        origUrl: o,
                        prefixes: e
                    };
                for (n = 0; a > n; n++) r = e[n].split("="), (t = A[r.shift()]) && (o = t(o, r));
                for (n = 0; i > n; n++) o = C[n](o);
                return o
            }

            function a(e, i, o, a, s) {
                var c = t(e),
                    l = c.autoCallback;
                c.url.split(".").pop().split("?").shift(), c.bypass || (i && (i = r(i) ? i : i[e] || i[a] || i[e.split("/").pop().split("?")[0]]), c.instead ? c.instead(e, i, o, a, s) : (S[c.url] ? c.noexec = !0 : S[c.url] = 1, o.load(c.url, c.forceCSS || !c.forceJS && "css" == c.url.split(".").pop().split("?").shift() ? "c" : n, c.noexec, c.attrs, c.timeout), (r(i) || r(l)) && o.load(function() {
                    u(), i && i(c.origUrl, s, a), l && l(c.origUrl, s, a), S[c.url] = 2
                })))
            }

            function s(e, t) {
                function n(e, n) {
                    if (e) {
                        if (i(e)) n || (d = function() {
                            var e = [].slice.call(arguments);
                            f.apply(this, e), p()
                        }), a(e, d, t, 0, l);
                        else if (Object(e) === e)
                            for (c in s = function() {
                                var t, n = 0;
                                for (t in e) e.hasOwnProperty(t) && n++;
                                return n
                            }(), e) e.hasOwnProperty(c) && (!n && !--s && (r(d) ? d = function() {
                                var e = [].slice.call(arguments);
                                f.apply(this, e), p()
                            } : d[c] = function(e) {
                                return function() {
                                    var t = [].slice.call(arguments);
                                    e && e.apply(this, t), p()
                                }
                            }(f[c])), a(e[c], d, t, c, l))
                    } else !n && p()
                }
                var s, c, l = !! e.test,
                    u = e.load || e.both,
                    d = e.callback || o,
                    f = d,
                    p = e.complete || o;
                n(l ? e.yep : e.nope, !! u), u && n(u)
            }
            var c, l, d = this.yepnope.loader;
            if (i(e)) a(e, 0, d, 0);
            else if (T(e))
                for (c = 0; c < e.length; c++) l = e[c], i(l) ? a(l, 0, d, 0) : T(l) ? f(l) : Object(l) === l && s(l, d);
            else Object(e) === e && s(e, d)
        }, f.addPrefix = function(e, t) {
            A[e] = t
        }, f.addFilter = function(e) {
            C.push(e)
        }, f.errorTimeout = 1e4, null == t.readyState && t.addEventListener && (t.readyState = "loading", t.addEventListener("DOMContentLoaded", d = function() {
            t.removeEventListener("DOMContentLoaded", d, 0), t.readyState = "complete"
        }, 0)), e.yepnope = u(), e.yepnope.executeStack = s, e.yepnope.injectJs = function(e, n, r, i, c, l) {
            var u, d, p = t.createElement("script"),
                i = i || f.errorTimeout;
            p.src = e;
            for (d in r) p.setAttribute(d, r[d]);
            n = l ? s : n || o, p.onreadystatechange = p.onload = function() {
                !u && a(p.readyState) && (u = 1, n(), p.onload = p.onreadystatechange = null)
            }, h(function() {
                u || (u = 1, n(1))
            }, i), c ? p.onload() : g.parentNode.insertBefore(p, g)
        }, e.yepnope.injectCss = function(e, n, r, i, a, c) {
            var l, i = t.createElement("link"),
                n = c ? s : n || o;
            i.href = e, i.rel = "stylesheet", i.type = "text/css";
            for (l in r) i.setAttribute(l, r[l]);
            a || (g.parentNode.insertBefore(i, g), h(n, 0))
        }
    }(this, document), Modernizr.load = function() {
    yepnope.apply(window, [].slice.call(arguments, 0))
};
var addToHome = function(e) {
    function t() {
        if (T) {
            var t, r = Date.now();
            if (e.addToHomeConfig)
                for (t in e.addToHomeConfig) E[t] = e.addToHomeConfig[t];
            E.autostart || (E.hookOnLoad = !1), d = /ipad/gi.test(x.platform), f = e.devicePixelRatio && e.devicePixelRatio > 1, p = /Safari/i.test(x.appVersion) && !/CriOS/i.test(x.appVersion), h = x.standalone, g = x.appVersion.match(/OS (\d+_\d+)/i), g = g[1] ? +g[1].replace("_", ".") : 0, A = +e.localStorage.getItem("addToHome"), v = e.sessionStorage.getItem("addToHomeSession"), y = E.returningVisitor ? A && A + 24192e5 > r : !0, A || (A = r), m = y && r >= A, E.hookOnLoad ? e.addEventListener("load", n, !1) : !E.hookOnLoad && E.autostart && n()
        }
    }

    function n() {
        if (e.removeEventListener("load", n, !1), y ? E.expire && m && e.localStorage.setItem("addToHome", Date.now() + 6e4 * E.expire) : e.localStorage.setItem("addToHome", Date.now()), $ || p && m && !v && !h && y) {
            var t = "",
                i = x.platform.split(" ")[0],
                o = x.language.replace("-", "_");
            b = document.createElement("div"), b.id = "addToHomeScreen", b.style.cssText += "left:-9999px;-webkit-transition-property:-webkit-transform,opacity;-webkit-transition-duration:0;-webkit-transform:translate3d(0,0,0);position:" + (5 > g ? "absolute" : "fixed"), E.message in N && (o = E.message, E.message = ""), "" === E.message && (E.message = o in N ? N[o] : N.en_us), E.touchIcon && (t = document.querySelector(f ? 'head link[rel^=apple-touch-icon][sizes="114x114"],head link[rel^=apple-touch-icon][sizes="144x144"]' : 'head link[rel^=apple-touch-icon][sizes="57x57"],head link[rel^=apple-touch-icon]'), t && (t = '<span style="background-image:url(' + t.href + ')" class="addToHomeTouchIcon"></span>')), b.className = (d ? "addToHomeIpad" : "addToHomeIphone") + (t ? " addToHomeWide" : ""), b.innerHTML = t + E.message.replace("%device", i).replace("%icon", g >= 4.2 ? '<span class="addToHomeShare"></span>' : '<span class="addToHomePlus">+</span>') + (E.arrow ? '<span class="addToHomeArrow"></span>' : "") + (E.closeButton ? '<span class="addToHomeClose">Ã—</span>' : ""), document.body.appendChild(b), E.closeButton && b.addEventListener("click", a, !1), !d && g >= 6 && window.addEventListener("orientationchange", u, !1), setTimeout(r, E.startDelay)
        }
    }

    function r() {
        var t, n = 208;
        if (d) switch (5 > g ? (S = e.scrollY, C = e.scrollX) : 6 > g && (n = 160), b.style.top = S + E.bottomOffset + "px", b.style.left = C + n - Math.round(b.offsetWidth / 2) + "px", E.animationIn) {
            case "drop":
                t = "0.6s", b.style.webkitTransform = "translate3d(0," + -(e.scrollY + E.bottomOffset + b.offsetHeight) + "px,0)";
                break;
            case "bubble":
                t = "0.6s", b.style.opacity = "0", b.style.webkitTransform = "translate3d(0," + (S + 50) + "px,0)";
                break;
            default:
                t = "1s", b.style.opacity = "0"
        } else switch (S = e.innerHeight + e.scrollY, 5 > g ? (C = Math.round((e.innerWidth - b.offsetWidth) / 2) + e.scrollX, b.style.left = C + "px", b.style.top = S - b.offsetHeight - E.bottomOffset + "px") : (b.style.left = "50%", b.style.marginLeft = -Math.round(b.offsetWidth / 2) - (e.orientation % 180 && g >= 6 ? 40 : 0) + "px", b.style.bottom = E.bottomOffset + "px"), E.animationIn) {
            case "drop":
                t = "1s", b.style.webkitTransform = "translate3d(0," + -(S + E.bottomOffset) + "px,0)";
                break;
            case "bubble":
                t = "0.6s", b.style.webkitTransform = "translate3d(0," + (b.offsetHeight + E.bottomOffset + 50) + "px,0)";
                break;
            default:
                t = "1s", b.style.opacity = "0"
        }
        b.offsetHeight, b.style.webkitTransitionDuration = t, b.style.opacity = "1", b.style.webkitTransform = "translate3d(0,0,0)", b.addEventListener("webkitTransitionEnd", s, !1), k = setTimeout(o, E.lifespan)
    }

    function i(e) {
        T && !b && ($ = e, n())
    }

    function o() {
        if (clearInterval(w), clearTimeout(k), k = null, b) {
            var t = 0,
                n = 0,
                r = "1",
                i = "0";
            switch (E.closeButton && b.removeEventListener("click", a, !1), !d && g >= 6 && window.removeEventListener("orientationchange", u, !1), 5 > g && (t = d ? e.scrollY - S : e.scrollY + e.innerHeight - S, n = d ? e.scrollX - C : e.scrollX + Math.round((e.innerWidth - b.offsetWidth) / 2) - C), b.style.webkitTransitionProperty = "-webkit-transform,opacity", E.animationOut) {
                case "drop":
                    d ? (i = "0.4s", r = "0", t += 50) : (i = "0.6s", t = t + b.offsetHeight + E.bottomOffset + 50);
                    break;
                case "bubble":
                    d ? (i = "0.8s", t = t - b.offsetHeight - E.bottomOffset - 50) : (i = "0.4s", r = "0", t -= 50);
                    break;
                default:
                    i = "0.8s", r = "0"
            }
            b.addEventListener("webkitTransitionEnd", s, !1), b.style.opacity = r, b.style.webkitTransitionDuration = i, b.style.webkitTransform = "translate3d(" + n + "px," + t + "px,0)"
        }
    }

    function a() {
        e.sessionStorage.setItem("addToHomeSession", "1"), v = !0, o()
    }

    function s() {
        return b.removeEventListener("webkitTransitionEnd", s, !1), b.style.webkitTransitionProperty = "-webkit-transform", b.style.webkitTransitionDuration = "0.2s", k ? void(5 > g && k && (w = setInterval(c, E.iterations))) : (b.parentNode.removeChild(b), void(b = null))
    }

    function c() {
        var t = new WebKitCSSMatrix(e.getComputedStyle(b, null).webkitTransform),
            n = d ? e.scrollY - S : e.scrollY + e.innerHeight - S,
            r = d ? e.scrollX - C : e.scrollX + Math.round((e.innerWidth - b.offsetWidth) / 2) - C;
        (n != t.m42 || r != t.m41) && (b.style.webkitTransform = "translate3d(" + r + "px," + n + "px,0)")
    }

    function l() {
        e.localStorage.removeItem("addToHome"), e.sessionStorage.removeItem("addToHomeSession")
    }

    function u() {
        b.style.marginLeft = -Math.round(b.offsetWidth / 2) - (e.orientation % 180 && g >= 6 ? 40 : 0) + "px"
    }
    var d, f, p, h, g, m, v, y, b, $, w, k, x = e.navigator,
        T = "platform" in x && /iphone|ipod|ipad/gi.test(x.platform),
        C = 0,
        S = 0,
        A = 0,
        E = {
            autostart: !0,
            returningVisitor: !1,
            animationIn: "drop",
            animationOut: "fade",
            startDelay: 2e3,
            lifespan: 15e3,
            bottomOffset: 14,
            expire: 0,
            message: "",
            touchIcon: !1,
            arrow: !0,
            hookOnLoad: !0,
            closeButton: !0,
            iterations: 100
        }, N = {
            ar: '<span dir="rtl">Ù‚Ù… Ø¨ØªØ«Ø¨ÙŠØª Ù‡Ø°Ø§ Ø§Ù„ØªØ·Ø¨ÙŠÙ‚ Ø¹Ù„Ù‰ <span dir="ltr">%device:</span>Ø§Ù†Ù‚Ø±<span dir="ltr">%icon</span> ØŒ<strong>Ø«Ù… Ø§Ø¶ÙÙ‡ Ø§Ù„Ù‰ Ø§Ù„Ø´Ø§Ø´Ø© Ø§Ù„Ø±Ø¦ÙŠØ³ÙŠØ©.</strong></span>',
            ca_es: "Per instalÂ·lar aquesta aplicaciÃ³ al vostre %device premeu %icon i llavors <strong>Afegir a pantalla d'inici</strong>.",
            cs_cz: "Pro instalaci aplikace na VÃ¡Å¡ %device, stisknÄ›te %icon a v nabÃ­dce <strong>PÅ™idat na plochu</strong>.",
            da_dk: "TilfÃ¸j denne side til din %device: tryk pÃ¥ %icon og derefter <strong>FÃ¸j til hjemmeskÃ¦rm</strong>.",
            de_de: "Installieren Sie diese App auf Ihrem %device: %icon antippen und dann <strong>Zum Home-Bildschirm</strong>.",
            el_gr: "Î•Î³ÎºÎ±Ï„Î±ÏƒÏ„Î®ÏƒÎµÏ„Îµ Î±Ï…Ï„Î®Î½ Ï„Î·Î½ Î•Ï†Î±ÏÎ¼Î¿Î³Î® ÏƒÏ„Î®Î½ ÏƒÏ…ÏƒÎºÎµÏ…Î® ÏƒÎ±Ï‚ %device: %icon Î¼ÎµÏ„Î¬ Ï€Î±Ï„Î¬Ï„Îµ <strong>Î ÏÎ¿ÏƒÎ¸Î®ÎºÎ· ÏƒÎµ Î‘Ï†ÎµÏ„Î·ÏÎ¯Î±</strong>.",
            en_us: "Install this web app on your %device: tap %icon and then <strong>Add to Home Screen</strong>.",
            es_es: "Para instalar esta app en su %device, pulse %icon y seleccione <strong>AÃ±adir a pantalla de inicio</strong>.",
            fi_fi: "Asenna tÃ¤mÃ¤ web-sovellus laitteeseesi %device: paina %icon ja sen jÃ¤lkeen valitse <strong>LisÃ¤Ã¤ Koti-valikkoon</strong>.",
            fr_fr: "Ajoutez cette application sur votre %device en cliquant sur %icon, puis <strong>Ajouter Ã  l'Ã©cran d'accueil</strong>.",
            he_il: '<span dir="rtl">×”×ª×§×Ÿ ××¤×œ×™×§×¦×™×” ×–×• ×¢×œ ×”-%device ×©×œ×š: ×”×§×© %icon ×•××– <strong>×”×•×¡×£ ×œ×ž×¡×š ×”×‘×™×ª</strong>.</span>',
            hr_hr: "Instaliraj ovu aplikaciju na svoj %device: klikni na %icon i odaberi <strong>Dodaj u poÄetni zaslon</strong>.",
            hu_hu: "TelepÃ­tse ezt a web-alkalmazÃ¡st az Ã–n %device-jÃ¡ra: nyomjon a %icon-ra majd a <strong>FÅ‘kÃ©pernyÅ‘hÃ¶z adÃ¡s</strong> gombra.",
            it_it: "Installa questa applicazione sul tuo %device: premi su %icon e poi <strong>Aggiungi a Home</strong>.",
            ja_jp: "ã“ã®ã‚¦ã‚§ãƒ–ã‚¢ãƒ—ãƒªã‚’ã‚ãªãŸã®%deviceã«ã‚¤ãƒ³ã‚¹ãƒˆãƒ¼ãƒ«ã™ã‚‹ã«ã¯%iconã‚’ã‚¿ãƒƒãƒ—ã—ã¦<strong>ãƒ›ãƒ¼ãƒ ç”»é¢ã«è¿½åŠ </strong>ã‚’é¸ã‚“ã§ãã ã•ã„ã€‚",
            ko_kr: '%deviceì— ì›¹ì•±ì„ ì„¤ì¹˜í•˜ë ¤ë©´ %iconì„ í„°ì¹˜ í›„ "í™ˆí™”ë©´ì— ì¶”ê°€"ë¥¼ ì„ íƒí•˜ì„¸ìš”',
            nb_no: "Installer denne appen pÃ¥ din %device: trykk pÃ¥ %icon og deretter <strong>Legg til pÃ¥ Hjem-skjerm</strong>",
            nl_nl: "Installeer deze webapp op uw %device: tik %icon en dan <strong>Voeg toe aan beginscherm</strong>.",
            pl_pl: "Aby zainstalowaÄ‡ tÄ™ aplikacje na %device: naciÅ›nij %icon a nastÄ™pnie <strong>Dodaj jako ikonÄ™</strong>.",
            pt_br: "Instale este aplicativo em seu %device: aperte %icon e selecione <strong>Adicionar Ã  Tela Inicio</strong>.",
            pt_pt: "Para instalar esta aplicaÃ§Ã£o no seu %device, prima o %icon e depois o <strong>Adicionar ao ecrÃ£ principal</strong>.",
            ru_ru: "Ð£ÑÑ‚Ð°Ð½Ð¾Ð²Ð¸Ñ‚Ðµ ÑÑ‚Ð¾ Ð²ÐµÐ±-Ð¿Ñ€Ð¸Ð»Ð¾Ð¶ÐµÐ½Ð¸Ðµ Ð½Ð° Ð²Ð°Ñˆ %device: Ð½Ð°Ð¶Ð¼Ð¸Ñ‚Ðµ %icon, Ð·Ð°Ñ‚ÐµÐ¼ <strong>Ð”Ð¾Ð±Ð°Ð²Ð¸Ñ‚ÑŒ Ð² Â«Ð”Ð¾Ð¼Ð¾Ð¹Â»</strong>.",
            sv_se: "LÃ¤gg till denna webbapplikation pÃ¥ din %device: tryck pÃ¥ %icon och dÃ¤refter <strong>LÃ¤gg till pÃ¥ hemskÃ¤rmen</strong>.",
            th_th: "à¸•à¸´à¸”à¸•à¸±à¹‰à¸‡à¹€à¸§à¹‡à¸šà¹à¸­à¸žà¸¯ à¸™à¸µà¹‰à¸šà¸™ %device à¸‚à¸­à¸‡à¸„à¸¸à¸“: à¹à¸•à¸° %icon à¹à¸¥à¸° <strong>à¹€à¸žà¸´à¹ˆà¸¡à¸—à¸µà¹ˆà¸«à¸™à¹‰à¸²à¸ˆà¸­à¹‚à¸®à¸¡</strong>",
            tr_tr: "Bu uygulamayÄ± %device'a eklemek iÃ§in %icon simgesine sonrasÄ±nda <strong>Ana Ekrana Ekle</strong> dÃ¼ÄŸmesine basÄ±n.",
            zh_cn: "æ‚¨å¯ä»¥å°†æ­¤åº”ç”¨ç¨‹å¼å®‰è£…åˆ°æ‚¨çš„ %device ä¸Šã€‚è¯·æŒ‰ %icon ç„¶åŽç‚¹é€‰<strong>æ·»åŠ è‡³ä¸»å±å¹•</strong>ã€‚",
            zh_tw: "æ‚¨å¯ä»¥å°‡æ­¤æ‡‰ç”¨ç¨‹å¼å®‰è£åˆ°æ‚¨çš„ %device ä¸Šã€‚è«‹æŒ‰ %icon ç„¶å¾Œé»žé¸<strong>åŠ å…¥ä¸»ç•«é¢èž¢å¹•</strong>ã€‚"
        };
    return t(), {
        show: i,
        close: o,
        reset: l
    }
}(window);
! function(e) {
    e("sanitize", function(e, t) {
        var n = {
            allowedTags: ["sub", "sup", "i", "b"],
            removeDangerousTags: function(e) {
                if (null == e) return "";
                var t = e;
                t = t.replace(/\&Klt;/g, "["), t = t.replace(/\&Kgt;/g, "]");
                for (var r = 0; r < n.allowedTags.length; r++) {
                    var i = n.allowedTags[r],
                        o = new RegExp("<" + i + ">", "gi"),
                        a = new RegExp("</" + i + ">", "gi");
                    t = t.replace(o, "&Klt;" + i + "&Kgt;"), t = t.replace(a, "&Klt;/" + i + "&Kgt;")
                }
                return t = t.replace(/>/g, "&gt;"), t = t.replace(/</g, "&lt;"), t = t.replace(/\&Klt;/g, "<"), t = t.replace(/\&Kgt;/g, ">"), t = t.replace(/"/g, "&quot;")
            },
            characterCount: function(e) {
                if (!e || !e.length) return 0;
                var t = n.plainText(e);
                return t.length
            },
            escapeTags: function(e) {
                return e ? String(e).replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;") : ""
            },
            escapeEntities: function(e) {
                return e ? (e = String(e), e = e.replace(/&(.+?);/g, "&amp;$1;"), e = e.replace(/"/g, "&quot;")) : ""
            },
            plainText: function(e) {
                var t = document.createElement("div");
                t.innerHTML = e;
                var n = t.textContent || t.innerText;
                return n
            },
            stripTags: function(e) {
                return e.replace(/<\w+(\s+("[^"]*"|'[^']*'|[^>])+)?>|<\/\w+>/gi, "")
            },
            wysiwigEncode: function(e) {
                return n.escapeEntities(n.removeDangerousTags(e))
            }
        };
        return void 0 !== t && (t.allowedTags = n.allowedTags, t.characterCount = n.characterCount, t.removeDangerousTags = n.removeDangerousTags, t.escapeTags = n.escapeTags, t.stripTags = n.stripTags, t.plainText = n.plainText, t.escapeEntities = n.escapeEntities, t.wysiwigEncode = n.wysiwigEncode), n
    })
}("function" == typeof define && define.amd ? define : function(e, t) {
    "undefined" != typeof exports ? t(require, exports) : (window.mobitroll = window.mobitroll || {}, t(function(e) {
        return window[e]
    }, window.mobitroll.sanitize = {}))
}), angular.module("app.services.browser", []).factory("browser", ["$window",
    function(e) {
        "use strict";

        function t() {
            var t, n, r = e.navigator.userAgent.match(/OS (\d+)_(\d+)_?(\d+)?/);
            return r && r.length >= 4 && (t = [parseInt(r[1], 10), parseInt(r[2], 10), parseInt(r[3] || 0, 10)], n = parseFloat(t.join(".")), !isNaN(n)) ? n : 0
        }
        var n = {
            isIos: function() {
                return /(iPhone|iPod|iPad)/i.test(e.navigator.userAgent) ? !0 : !1
            },
            isIphone: function() {
                return !this.isIpad() && e.navigator.userAgent.match(/iPhone/i) ? !0 : !1
            },
            isIpad: function() {
                return e.navigator.userAgent.match(/iPad/i) ? !0 : !1
            },
            isIosSafari: function() {
                return this.isIos() && /version/i.test(e.navigator.userAgent)
            },
            isIosChrome: function() {
                return this.isIos() && /CriOS/i.test(e.navigator.userAgent)
            },
            isLessThanIos6: function() {
                return this.isIos() && t() > 0 && t() < 6
            },
            isOpera: function() {
                return e.opera || !1
            },
            isNativeAndroid: function() {
                return e.navigator.userAgent.match(/android(?!.*(chrome|firefox))/i) ? !0 : !1
            },
            isAndroidKitKat: function() {
                return /(android 4\.4)/i.test(e.navigator.userAgent)
            },
            isIE9: function() {
                return /\bie9\b/.test(e.document.querySelector("html").className)
            },
            isIElte10: function() {
                return -1 !== e.navigator.userAgent.indexOf("MSIE")
            },
            isIE11: function() {
                return -1 === e.navigator.userAgent.indexOf("MSIE") && -1 !== e.navigator.userAgent.indexOf("Trident")
            },
            isIElte11: function() {
                return this.isIElte10() || this.isIE11()
            }
        };
        return n
    }
]), angular.module("app.services.config", ["ng"]).factory("$config", ["$location", "$routeParams",
    function(e) {
        function t(e) {
            var t = e.split(".");
            return t.length > 0 ? t[0] : ""
        }

        function n(t) {
            var n = /.*kahoot.local/,
                r = /.*kahoot-stage.it/,
                i = /.*kahoot-experimental.it/,
                o = /.*kahoot.it/,
                a = /kahoot.local/,
                s = t.dev;
            return i.test(e.host()) ? s = t.test : r.test(e.host()) ? s = t.stage : o.test(e.host()) ? s = t.prod : n.test(e.host()) ? s = t.advdev : a.test(e.host()) && (s = t.devnoproxy || t.dev), "string" == typeof s || s instanceof String ? s.replace(/^proto:/, e.protocol() + ":") : s
        }
        var r = {
            getHost: function() {
                var t = e.host().match(/[a-z-]+\.[a-z]+$/);
                return t && t.length > 0 ? t[0] : ""
            },
            xss_domain: n({
                dev: "localhost",
                advdev: "kahoot.local",
                test: "kahoot-experimental.it",
                stage: "kahoot-stage.it",
                prod: "kahoot.it"
            }),
            environment: n({
                dev: "dev",
                advdev: "advdev",
                test: "test",
                stage: "stage",
                prod: "prod"
            }),
            analytics: {
                batchSize: 10,
                baseUrl: n({
                    dev: "/rest",
                    devnoproxy: "http://hal.kahoot.local:9001",
                    advdev: "/rest",
                    test: "/rest",
                    stage: "/rest",
                    prod: "/rest"
                }),
                debug: n({
                    dev: !0,
                    advdev: !1,
                    test: !0,
                    stage: !1,
                    prod: !1
                })
            },
            cdn: {
                baseUrl: n({
                    dev: "proto://d6am0t1arx3yz.cloudfront.net",
                    advdev: "proto://media.kahoot-experimental.it",
                    test: "proto://media.kahoot-experimental.it",
                    stage: "proto://media.kahoot.it",
                    prod: "proto://media.kahoot.it"
                })
            },
            builder: {
                baseUrl: n({
                    dev: "proto://" + e.host() + ":8002",
                    advdev: "proto://create.kahoot.local",
                    test: "proto://create.kahoot-experimental.it",
                    stage: "proto://create.kahoot-stage.it",
                    prod: "proto://create.kahoot.it"
                })
            },
            player: {
                introDuration: 5,
                baseUrl: n({
                    dev: "proto://" + e.host() + ":8001",
                    advdev: "proto://play.kahoot.local",
                    test: "proto://play.kahoot-experimental.it",
                    stage: "proto://play.kahoot-stage.it",
                    prod: "proto://play.kahoot.it"
                })
            },
            controller: {
                baseUrl: n({
                    dev: "proto://" + e.host() + ":8000",
                    advdev: "proto://kahoot.local",
                    test: "proto://kahoot-experimental.it",
                    stage: "proto://kahoot-stage.it",
                    prod: "proto://kahoot.it"
                })
            },
            usergrid: {
                server: n({
                    dev: "//create.kahoot-experimental.it/rest",
                    advdev: "/rest",
                    test: "/rest",
                    stage: "/rest",
                    prod: "/rest"
                })
            },
            webpurify: {
                key: n({
                    dev: "135d6f571ed76470aef59395ca137046",
                    advdev: "135d6f571ed76470aef59395ca137046",
                    test: "135d6f571ed76470aef59395ca137046",
                    stage: "135d6f571ed76470aef59395ca137046",
                    prod: "135d6f571ed76470aef59395ca137046"
                })
            },
            bugsense: {
                key: n({
                    dev: "2a60b49a",
                    advdev: "2a60b49a",
                    test: "2a60b49a",
                    stage: "2a60b49a",
                    prod: "d3a5d794"
                }),
                enabled: n({
                    dev: !1,
                    advdev: !1,
                    test: !0,
                    stage: !0,
                    prod: !0
                })
            },
            session: {
                api: n({
                    dev: "",
                    advdev: "/reserve",
                    test: "/reserve",
                    stage: "/reserve",
                    prod: "/reserve"
                })
            },
            social: {
                socialAuth: n({
                    dev: "//db.kahoot-experimental.it/auth/auth",
                    advdev: "//db.kahoot.local/auth/auth",
                    test: "//db.kahoot-experimental.it/auth/auth",
                    stage: "//db.kahoot-stage.it/auth/auth",
                    prod: "//db.kahoot.it/auth/auth"
                })
            },
            facebook: {
                appid: n({
                    dev: "126467790894818",
                    advdev: "126467790894818",
                    test: "126467790894818",
                    stage: "126467790894818",
                    prod: "100369743487255"
                })
            },
            mixpanel: {
                token: n({
                    dev: "2a69924f772124f83a747f0c88d373cc",
                    advdev: "2a69924f772124f83a747f0c88d373cc",
                    test: "2a69924f772124f83a747f0c88d373cc",
                    stage: "2a69924f772124f83a747f0c88d373cc",
                    prod: "4295d911a630aedf6e18a1eb8eca91a8"
                })
            },
            scoring: {
                min: 500,
                max: 1e3,
                upperThreshold: 1
            },
            anonuser: n({
                dev: {
                    name: "anonymous",
                    token: "6M]485077K9w7Vk"
                },
                advdev: {
                    name: "anonymous",
                    token: "6M]485077K9w7Vk"
                },
                test: {
                    name: "anonymous",
                    token: "6M]485077K9w7Vk"
                },
                stage: {
                    name: "anonymous",
                    token: "6M]485077K9w7Vk"
                },
                prod: {
                    name: "anonymous",
                    token: "6M]485077K9w7Vk"
                }
            }),
            subdomain: t(e.host()),
            comet: {
                protocol: e.protocol() + "://",
                server: n({
                    dev: e.host() + ":8080",
                    advdev: e.host(),
                    test: e.host(),
                    stage: e.host(),
                    prod: e.host()
                }),
                contextPath: "",
                logLevel: n({
                    dev: "debug",
                    advdev: "debug",
                    test: "debug",
                    stage: "debug",
                    prod: "debug"
                }),
                events: {
                    getReady: 1,
                    startQuestion: 2,
                    gameOver: 3,
                    timeUp: 4,
                    playAgain: 5,
                    answerSelected: 6,
                    answerResponse: 7,
                    revealAnswer: 8,
                    startQuiz: 9,
                    resetController: 10,
                    submitFeedback: 11,
                    feedback: 12,
                    revealRanking: 13
                }
            },
            kickCodes: {
                general: 1
            },
            isClickerKeycode: function(e) {
                return 32 == e || 34 == e ? !0 : !1
            },
            sessionTimeout: 36e5,
            mapImageUrl: function(e) {
                if (!e) return null;
                var t = /.*\/(.+?)$/i;
                if (e.match(t).length > 1) {
                    var n = e.match(t)[1];
                    e = r.cdn.baseUrl + "/" + n
                }
                return e
            }
        };
        return r
    }
]), angular.module("app.services.comet", ["app.services.config"]).factory("$comet", ["$config", "$window", "$log", "$http", "browser",
    function(e, t, n, r, i) {
        function o() {
            var e = new org.cometd.LongPollingTransport,
                t = org.cometd.Transport.derive(e);
            return t.xhrSend = function(e) {
                var t = e.headers || {};
                t["Content-Type"] = "application/json;charset=UTF-8";
                var i = r({
                    method: "POST",
                    url: e.url,
                    data: e.body,
                    headers: t,
                    withCredentials: !0,
                    timeout: 4e4
                }).success(function(t) {
                    e.onSuccess(t)
                }).error(function(t, n) {
                    e.onError(n, t)
                });
                return i.abort = function() {
                    n.log("Abort called by Cometd on a $http request promise (long-polling).")
                }, i
            }, t
        }
        org.cometd.JSON = {}, org.cometd.JSON.toJSON = angular.toJson, org.cometd.JSON.fromJSON = angular.fromJson;
        var a = new org.cometd.Cometd("comet-service");
        return org.cometd.WebSocket && a.registerTransport("websocket", new org.cometd.WebSocketTransport), a.registerTransport("long-polling", new o), (i.isNativeAndroid() || i.isLessThanIos6()) && a.unregisterTransport("websocket"), t.onbeforeunload = function() {
            a.isDisconnected() || a.disconnect(!0)
        }, i.isOpera() && (t.onunload = t.onbeforeunload), a.configure({
            url: e.comet.protocol + e.comet.server + e.comet.contextPath + "/cometd",
            logLevel: e.comet.logLevel,
            maxNetworkDelay: 4e4
        }), a
    }
]), angular.module("app.services.comet-ack", ["app.services.config", "app.services.comet"]).factory("$comet-ack", ["$config", "$log", "$comet",
    function(e, t, n) {
        function r(e) {
            var t = new e;
            return n.registerExtension("ack", t), t
        }
        return r(org.cometd.AckExtension, n), n
    }
]), angular.module("app.services.comet-timesync", ["app.services.config", "app.services.comet"]).factory("$comet-timesync", ["$config", "$log", "$comet",
    function(e, t, n) {
        function r(e) {
            var t = new e;
            return n.registerExtension("timesync", t), t
        }
        return r(org.cometd.TimeSyncExtension, n), n
    }
]), angular.module("app.services.network", ["underscore", "app.services.comet"]).factory("$network", ["$config", "$log", "_", "$comet", "$timeout", "$rootScope",
    function(e, t, n, r, i, o) {
        function a(e) {
            var e = e || 3e3;
            l && i(function() {
                c(), a(e)
            }, e)
        }

        function s() {
            function e() {
                c()
            }
            u || (d = o.$on("messageRecieved", e), f = o.$on("connectionHeartbeat", e))
        }

        function c() {
            var e = p.getLag(),
                n = p.getAsssesment();
            t.log("Current estimated average lag: " + e + "ms"), o.$broadcast(p.events.lagUpdate, {
                lag: e,
                assessment: n
            })
        }
        var l = !1,
            u = !1,
            d = null,
            f = null,
            p = {
                latencyThreshold: {
                    unplayable: 3e3,
                    playableWithDifficulty: 300,
                    playable: 0
                },
                events: {
                    lagUpdate: "network.lagupdate"
                },
                getAsssesment: function() {
                    var e = p,
                        t = e.getLag();
                    return t > e.latencyThreshold.unplayable ? e.latencyThreshold.unplayable : t > e.latencyThreshold.playableWithDifficulty ? e.latencyThreshold.playableWithDifficulty : e.latencyThreshold.playable
                },
                getLag: function() {
                    return r.getExtension("timesync").getNetworkLag()
                },
                watchNetworkWithTimeout: function(e) {
                    l || (l = !0, a(e))
                },
                unWatchNetworkWithTimeout: function() {
                    l && (l = !1)
                },
                watchNetworkMessages: function() {
                    u || (d && (d(), f(), d = null, f = null, u = !1), s(), u = !0)
                },
                unwatchNetworkMessages: function() {
                    u && (u = !1, d && (d(), f(), d = null, f = null))
                }
            };
        return p
    }
]), angular.module("app.services.mobitroll", ["app.services.comet", "app.services.comet-ack", "app.services.comet-timesync", "ngCookies"]).factory("$mobitroll", ["$comet", "$config", "$location", "$rootScope", "$log", "$cookieStore", "$window", "$timeout", "$comet-ack", "$comet-timesync",
    function(e, t, n, r, i, o, a, s) {
        function c(e) {
            e.successful ? (p.handshaked = !0, r.$broadcast("handshakeSuccess", e)) : r.$broadcast("handshakeFailure", e)
        }

        function l(e) {
            i.log(e), r.$broadcast("channelFailure", e)
        }

        function u(e) {
            r.$broadcast("messageRecieved", e)
        }

        function d(e) {
            r.$broadcast("subscribed", e)
        }

        function f(t) {
            if (r.$broadcast("connectionHeartbeat", t), e.isDisconnected()) return p.connected = !1, void r.$broadcast("connectionClosed", t);
            var n = p.connected;
            p.connected = t.successful === !0, !n && p.connected ? r.$broadcast("connectionEstablished", t) : n && !p.connected && r.$broadcast("connectionBroken", t)
        }
        var p = {
            handshaked: !1,
            connected: !1,
            connect: function(t) {
                o.put("no.mobitroll.session", t), s(function() {
                    var t = p;
                    t.handshaked || (e.addListener("/meta/handshake", c), e.addListener("/meta/connect", f), e.addListener("/meta/subscribe", d), e.addListener("/meta/unsuccessful", l), e.handshake())
                }, 50)
            },
            disconnect: function() {
                e.disconnect(!0), e.clearListeners(), p.handshaked = !1
            },
            withComet: function(t) {
                return t(e)
            },
            redirect: function(e) {
                var t = p;
                n.path(e), t.usingWebsockets() && (r.$$phase || r.$apply())
            },
            publish: function(t, n) {
                e.publish(t, n)
            },
            subscribe: function(t) {
                return e.subscribe(t, u)
            },
            unsubscribe: function(t) {
                return e.unsubscribe(t)
            },
            usingWebsockets: function() {
                return e.getTransport() ? "websocket" === e.getTransport().getType().toLowerCase() : !1
            },
            ensureConnection: function() {
                var e = p;
                return e.handshaked ? !1 : (e.redirect("/"), !0)
            },
            clientId: function() {
                return e.getClientId()
            },
            isConnected: function() {
                return this.handshaked && this.connected
            },
            batch: function(t, n) {
                var r = p;
                if (t && t.length > 0) {
                    var o = r.batchify(t);
                    _.each(o, function(t) {
                        try {
                            e.batch(function() {
                                _.each(t, function(e) {
                                    n(e)
                                })
                            })
                        } catch (r) {
                            i.warn("Something went wrong sending a cometd batch, keeping calm and carrying on. " + r.message)
                        }
                    })
                }
            },
            batchify: function(e) {
                for (var t = 200, n = [], r = 0; r < e.length;) {
                    var i = e.slice(r, r + t);
                    n.push(i), r += t
                }
                return n
            }
        };
        return p
    }
]), angular.module("app.services.utils", ["underscore"]).factory("$utils", ["$window", "$document", "_",
    function(e, t, n) {
        var r = {
            findElemById: function(e, r) {
                return n.map(n.filter(t.find(e), function(e) {
                    return e.id == r
                }), function(e) {
                    return angular.element(e)
                })
            },
            hasFlash: function() {
                return "undefined" != typeof e.navigator.plugins && "object" == typeof e.navigator.plugins["Shockwave Flash"] || e.ActiveXObject && 0 != new ActiveXObject("ShockwaveFlash.ShockwaveFlash")
            },
            isIOS: function() {
                return r.isMobile.iOS()
            },
            ordinal: function(e) {
                e = String(e);
                var t = e.substr(-Math.min(e.length, 2)) > 3 && e.substr(-Math.min(e.length, 2)) < 21 ? "th" : ["th", "st", "nd", "rd", "th"][Math.min(Number(e) % 10, 4)];
                return t
            },
            isMobile: {
                Android: function() {
                    return e.navigator.userAgent.match(/Android/i) ? !0 : !1
                },
                BlackBerry: function() {
                    return e.navigator.userAgent.match(/BlackBerry/i) ? !0 : !1
                },
                iOS: function() {
                    return e.navigator.userAgent.match(/iPhone|iPad|iPod/i) ? !0 : !1
                },
                Windows: function() {
                    return e.navigator.userAgent.match(/IEMobile/i) ? !0 : !1
                },
                any: function() {
                    return r.isMobile.Android() || r.isMobile.BlackBerry() || r.isMobile.iOS() || r.isMobile.Windows()
                }
            }
        };
        return r
    }
]), angular.module("app.services.webpurify", ["underscore"]).factory("$webpurify", ["$http", "$log", "$config", "_",
    function(e, t, n) {
        function r(e, t) {
            var n = i("%METHOD%", e, a);
            return n = i("%TEXT%", t, n), n = i("%CALLBACK%", "JSON_CALLBACK", n)
        }

        function i(e, t, n) {
            var r = new RegExp(e, "g");
            return n.replace(r, t)
        }

        function o(n, r, i) {
            e.jsonp(n).success(function(e) {
                t.log(e), e.rsp && e.rsp.err ? i && i(e.rsp.err["@attributes"].msg) : r(e)
            }).error(function(e, n) {
                t.log("Error contacting profanity service, server said '" + n + "'"), i && i(n)
            })
        }
        var a = "//api1.webpurify.com/services/rest/?api_key=%API_KEY%&method=%METHOD%&format=json&lang=%LANG%&callback=%CALLBACK%&text=%TEXT%",
            s = "en",
            c = "",
            l = {
                check: "webpurify.live.check",
                checkcount: "webpurify.live.checkcount",
                replace: "webpurify.live.replace",
                returnProfanity: "webpurify.live.return"
            }, u = {
                init: function(e) {
                    c = e, a = a.replace(/%API_KEY%/g, c), a = a.replace(/%LANG%/g, s)
                },
                check: function(e, t) {
                    var n = r(l.check, e);
                    o(n, function(e) {
                        var n = e.rsp.found > 0;
                        t(n)
                    })
                },
                checkcount: function(e, t) {
                    var n = r(l.checkcount, e);
                    o(n, function(e) {
                        var n = e.rsp.found;
                        t(n)
                    })
                },
                replace: function(e, t, n) {
                    var i = r(l.replace, e);
                    i += "&replacesymbol=" + escape(t), o(i, function(e) {
                        var t = e.rsp.text;
                        n(t)
                    })
                },
                returnProfanity: function(e, n) {
                    var i = r(l.returnProfanity, e);
                    o(i, function(e) {
                        var t = e.rsp.expletive;
                        n(t)
                    }, function(e) {
                        t.log("Error cleaning string, falling back to original: " + e), n(null)
                    })
                }
            };
        return function() {
            u.init(n.webpurify.key)
        }(), u
    }
]), angular.module("app.services.profanityfilter", ["underscore", "app.services.webpurify"]).factory("$profanityfilter", ["$webpurify", "$log", "$config", "_",
    function(e, t, n, r) {
        var i = {
            clean: function(n, o) {
                e.returnProfanity(n, function(e) {
                    var a = n;
                    e && ("string" == typeof e && (e = [e]), t.log("$webpurify.returnProfanity() - " + e), r.each(e, function(e) {
                        var n = new RegExp("" + e, "i"),
                            r = i.getRandomWord();
                        t.log("Replacing " + e + " with " + r), a = a.replace(n, i.getRandomWord())
                    })), o(a)
                })
            },
            getRandomWord: function() {
                var e = Math.floor(Math.random() * o.length);
                return o[e]
            }
        }, o = ["aardvark", "accordion", "accountant", "actor", "actress", "adapter", "adult", "advantage", "advertisement", "afghanistan", "africa", "afternoon", "aftershave", "aeroplane", "airport", "alarm", "albatross", "algebra", "algeria", "alibi", "alley", "alligator", "alloy", "alphabet", "aluminium", "ambulance", "america", "amusement", "anatomy", "anethesiologist", "angle", "animal", "ankle", "answer", "ant", "antarctica", "anteater", "antelope", "anthropology", "apartment", "apology", "apparatus", "appeal", "appendix", "apple", "appliance", "approval", "april", "aquarius", "arch", "archaeology", "archer", "architecture", "area", "argentina", "argument", "aries", "arithmetic", "arm", "armadillo", "armchair", "armenian", "army", "arrow", "art", "ash", "asia", "asparagus", "asphalt", "asterisk", "astronomy", "athlete", "atom", "attack", "attempt", "attention", "attic", "attraction", "august", "aunt", "australia", "australian", "author", "avenue", "baboon", "baby", "back", "backbone", "bacon", "badge", "badger", "bag", "bagel", "bagpipe", "bail", "bait", "baker", "bakery", "balance", "ball", "balloon", "bamboo", "banana", "band", "bandana", "bangladesh", "bangle", "banjo", "bank", "banker", "bar", "barbara", "barber", "barge", "baritone", "barometer", "base", "baseball", "basement", "basin", "basket", "basketball", "bass", "bassoon", "bat", "bath", "bathroom", "bathtub", "battery", "battle", "bay", "beach", "bead", "beam", "bean", "bear", "beard", "beast", "beat", "beautician", "beauty", "beaver", "bed", "bedroom", "bee", "beech", "beef", "beet", "beetle", "beginner", "behaviour", "belgian", "belief", "believe", "bell", "belt", "bench", "bengal", "beret", "berry", "bestseller", "betty", "bibliography", "bicycle", "bike", "bill", "billboard", "biology", "birch", "bird", "birth", "birthday", "bit", "bite", "black", "bladder", "blade", "blanket", "blinker", "blizzard", "block", "blouse", "blue", "board", "boat", "body", "bolt", "bomb", "bomber", "bone", "bongo", "bonsai", "book", "bookcase", "booklet", "boot", "border", "botany", "bottle", "bottom", "boundary", "bow", "bowl", "bowling", "box", "boy", "brace", "bracket", "brain", "brake", "branch", "brand", "brandy", "brass", "brazil", "bread", "break", "breakfast", "breath", "brian", "brick", "bridge", "british", "broccoli", "brochure", "broker", "bronze", "brother", "brother-in-law", "brow", "brown", "brush", "bubble", "bucket", "budget", "buffer", "buffet", "building", "bulb", "bull", "bulldozer", "bumper", "bun", "burglar", "burma", "burst", "bus", "bush", "business", "butcher", "butter", "button", "buzzard", "cabbage", "cabinet", "cable", "cactus", "cafe", "cake", "calculator", "calculus", "calendar", "calf", "call", "camel", "camera", "camp", "can", "canada", "canadian", "candle", "cannon", "canoe", "canvas", "cap", "capital", "capricorn", "captain", "caption", "car", "caravan", "carbon", "card", "cardboard", "cardigan", "care", "carnation", "carol", "carp", "carpenter", "carriage", "carrot", "cart", "cartoon", "case", "cast", "cat", "catamaran", "caterpillar", "cathedral", "cattle", "cauliflower", "caution", "cave", "ceiling", "celery", "cell", "cellar", "cello", "celsius", "cement", "cemetery", "cent", "centimeter", "century", "ceramic", "cereal", "certification", "chain", "chair", "chalk", "chance", "change", "channel", "character", "charles", "chauffeur", "check", "cheek", "cheese", "cheetah", "chef", "chemistry", "cheque", "cherries", "cherry", "chess", "chest", "chick", "chicken", "chief", "child", "children", "chill", "chime", "chimpanzee", "chin", "china", "chinese", "chive", "chocolate", "chord", "christmas", "christopher", "church", "cinema", "circle", "circulation", "cirrus", "citizenship", "city", "clam", "clarinet", "class", "claus", "clave", "clef", "clerk", "click", "client", "climb", "clipper", "cloakroom", "clock", "close", "closet", "cloth", "cloud", "cloudy", "clover", "club", "clutch", "coach", "coal", "coast", "coat", "cobweb", "cockroach", "cocktail", "cocoa", "cod", "coffee", "coil", "coin", "coke", "cold", "collar", "college", "collision", "colombia", "colour", "colt", "column", "columnist", "comb", "comfort", "comic", "comma", "command", "commission", "committee", "community", "company", "comparison", "competition", "competitor", "composer", "composition", "computer", "condition", "condor", "cone", "confirmation", "conga", "congo", "conifer", "connection", "consonant", "continent", "control", "cook", "cooking", "copper", "copy", "copyright", "cord", "cork", "cormorant", "corn", "cornet", "correspondent", "cost", "cotton", "couch", "cough", "country", "course", "court", "cousin", "cover", "cow", "cowbell", "crab", "crack", "cracker", "craftsman", "crate", "crayfish", "crayon", "cream", "creator", "creature", "credit", "creditor", "creek", "crib", "cricket", "crime", "criminal", "crocodile", "crocus", "croissant", "crook", "crop", "cross", "crow", "crowd", "crown", "crush", "cry", "cub", "cuban", "cucumber", "cultivator", "cup", "cupboard", "cupcake", "currency", "current", "curtain", "curve", "cushion", "custard", "customer", "cut", "cycle", "cyclone", "cylinder", "cymbal", "dad", "daffodil", "daisy", "damage", "dance", "dancer", "danger", "daniel", "dash", "dashboard", "database", "date", "daughter", "david", "day", "deadline", "deal", "deborah", "debt", "debtor", "decade", "december", "decimal", "decision", "decrease", "dedication", "deer", "defense", "deficit", "degree", "delete", "delivery", "den", "denim", "dentist", "deodorant", "department", "deposit", "description", "desert", "design", "desire", "desk", "dessert", "destruction", "detail", "detective", "development", "dew", "diamond", "diaphragm", "dibble", "dictionary", "dietician", "difference", "digestion", "digger", "digital", "dill", "dime", "dimple", "dinghy", "dinner", "dinosaur", "diploma", "dipstick", "direction", "disadvantage", "discovery", "discussion", "disgust", "dish", "distance", "distributor", "diving", "division", "dock", "doctor", "dog", "doll", "dollar", "dolphin", "domain", "donald", "donkey", "donna", "door", "dorothy", "double", "doubt", "downtown", "dragon", "dragonfly", "drain", "drake", "drama", "draw", "drawbridge", "drawer", "dream", "dress", "dresser", "dressing", "drill", "drink", "drive", "driver", "driving", "drizzle", "drop", "drug", "drum", "dry", "dryer", "duck", "duckling", "dugout", "dungeon", "dust", "eagle", "ear", "earth", "earthquake", "ease", "east", "edge", "editor", "editorial", "education", "edward", "eel", "effect", "egg", "eggnog", "eggplant", "egypt", "eight", "elbow", "element", "elephant", "elizabeth", "ellipse", "employee", "employer", "encyclopedia", "end", "enemy", "energy", "engine", "engineer", "english", "entrance", "environment", "equinox", "equipment", "era", "error", "estimate", "ethernet", "ethiopia", "europe", "evening", "event", "examination", "example", "exchange", "exclamation", "exhaust", "expert", "explanation", "eye", "eyebrow", "eyelash", "eyeliner", "face", "fact", "factory", "fahrenheit", "fairies", "fall", "family", "fan", "fang", "farm", "farmer", "father", "faucet", "fear", "feast", "feather", "feature", "february", "feedback", "feeling", "feet", "female", "ferry", "ferryboat", "fertiliser", "fiber", "fiberglass", "fibre", "fiction", "field", "fifth", "fight", "fighter", "file", "find", "fine", "finger", "fir", "fire", "fireman", "fireplace", "firewall", "fish", "fisherman", "flag", "flame", "flare", "flat", "flavour", "flesh", "flight", "flock", "flood", "floor", "flower", "flute", "fly", "foam", "fog", "fold", "font", "food", "foot", "football", "footnote", "force", "forecast", "forehead", "forest", "forgery", "fork", "form", "format", "fortnight", "foundation", "fountain", "fowl", "fox", "fragrance", "frame", "france", "freckle", "freeze", "freezer", "french", "friction", "friday", "fridge", "friend", "frog", "front", "frost", "frown", "fruit", "fuel", "fur", "furniture", "galley", "gallon", "game", "garage", "garden", "garlic", "gas", "gasoline", "gate", "gateway", "gauge", "gazelle", "gear", "geese", "gemini", "geography", "geology", "geometry", "george", "geranium", "german", "germany", "ghana", "ghost", "giant", "giraffe", "girl", "glass", "glider", "gliding", "glockenspiel", "glove", "glue", "goal", "goat", "gold", "goldfish", "golf", "gondola", "gong", "good-bye", "goose", "gorilla", "gosling", "government", "governor", "grade", "grain", "gram", "granddaughter", "grandfather", "grandmother", "grandson", "grape", "graphic", "grass", "grasshopper", "gray", "grease", "greece", "greek", "green", "grey", "grill", "grip", "ground", "group", "grouse", "growth", "guarantee", "guatemalan", "guide", "guilty", "guitar", "gum", "gym", "gymnast", "hail", "hair", "haircut", "halibut", "hall", "hallway", "hamburger", "hammer", "hamster", "hand", "handball", "handle", "harbor", "hardboard", "hardcover", "hardhat", "hardware", "harmonica", "harmony", "harp", "hat", "hawk", "head", "headlight", "headline", "health", "hearing", "heart", "heat", "heaven", "hedge", "height", "helen", "helicopter", "helium", "hell", "help", "hemp", "hen", "heron", "herring", "hexagon", "hill", "himalayan", "hip", "hippopotamus", "history", "hobbies", "hockey", "hole", "holiday", "home", "honey", "hood", "hook", "hope", "horn", "horse", "hose", "hospital", "hot", "hour", "hourglass", "house", "hovercraft", "hub", "hubcap", "humidity", "humour", "hurricane", "hyacinth", "hydrant", "hydrogen", "hyena", "hygienic", "ice", "icebreaker", "icicle", "icon", "idea", "ikebana", "illegal", "improvement", "impulse", "inch", "income", "increase", "index", "india", "indonesia", "industry", "ink", "innocent", "input", "insect", "instruction", "instrument", "insurance", "interactive", "interest", "internet", "interviewer", "intestine", "invention", "invoice", "iran", "iraq", "iris", "iron", "island", "israel", "italian", "italy", "jacket", "jaguar", "jam", "james", "january", "japan", "japanese", "jar", "jasmine", "jason", "jaw", "jeans", "jeep", "jeff", "jelly", "jellyfish", "jennifer", "jet", "jewel", "jogging", "john", "join", "joke", "joseph", "journey", "judge", "judo", "juice", "july", "jumbo", "jump", "jumper", "june", "jury", "justice", "kamikaze", "kangaroo", "karate", "karen", "kayak", "kendo", "kenneth", "kenya", "ketchup", "kettle", "kevin", "key", "keyboard", "kick", "kidney", "kilogram", "kilometer", "kimberly", "kiss", "kitchen", "kite", "kitten", "kitty", "knee", "knickers", "knight", "knot", "knowledge", "korean", "lace", "ladybug", "lake", "lamb", "lamp", "land", "language", "lasagna", "latency", "latex", "laugh", "laundry", "laura", "law", "lawyer", "layer", "lead", "leaf", "learning", "leather", "leek", "leg", "legal", "lemonade", "lentil", "leo", "leopard", "letter", "lettuce", "level", "libra", "library", "license", "lift", "light", "lightning", "lilac", "lily", "limit", "linda", "line", "linen", "link", "lion", "lip", "lipstick", "liquid", "liquor", "lisa", "literature", "litter", "liver", "lizard", "llama", "loaf", "loan", "lobster", "lock", "locket", "locust", "look", "loss", "lotion", "love", "low", "lumber", "lunch", "lunchroom", "lung", "lycra", "lynx", "lyric", "macaroni", "machine", "magazine", "magic", "magician", "maid", "mail", "mailbox", "mailman", "makeup", "malaysia", "male", "mall", "mallet", "man", "manager", "mandolin", "manicure", "map", "maple", "maraca", "marble", "march", "margaret", "margin", "maria", "mark", "market", "married", "mary", "mascara", "mask", "mass", "match", "math", "may", "mayonnaise", "meal", "measure", "meat", "mechanic", "medicine", "meeting", "melody", "memory", "men", "menu", "mercury", "message", "metal", "meteorology", "meter", "mexican", "mexico", "mice", "michael", "michelle", "microwave", "middle", "mile", "milk", "milkshake", "millennium", "millimeter", "millisecond", "mind", "mine", "minibus", "mini-skirt", "minister", "mint", "minute", "mirror", "missile", "mist", "mistake", "mitten", "moat", "modem", "mole", "mum", "monday", "money", "monkey", "month", "moon", "morning", "morocco", "mosque", "mosquito", "mother", "motion", "motorboat", "motorcycle", "mountain", "mouse", "moustache", "mouth", "move", "multimedia", "muscle", "museum", "music", "musician", "mustard", "myanmar", "nail", "name", "nancy", "napkin", "nation", "neck", "need", "needle", "neon", "nepal", "nephew", "nerve", "nest", "net", "network", "news", "newsprint", "newsstand", "niece", "nigeria", "night", "nitrogen", "node", "noise", "noodle", "north", "north america", "north korea", "norwegian", "nose", "note", "notebook", "notify", "novel", "november", "number", "numeric", "nurse", "nut", "nylon", "oak", "oatmeal", "objective", "oboe", "observation", "occupation", "ocean", "octagon", "octave", "october", "octopus", "offence", "offer", "office", "oil", "okra", "olive", "onion", "open", "opera", "operation", "opinion", "option", "orange", "orchestra", "orchid", "order", "organ", "organisation", "ornament", "ostrich", "otter", "ounce", "output", "oval", "oven", "overcoat", "owl", "owner", "ox", "oxygen", "oyster", "package", "packet", "page", "pail", "pain", "paint", "pair", "pakistan", "palm", "pamphlet", "pan", "pancake", "pancreas", "panda", "pansy", "panther", "pantry", "pants", "paper", "paperback", "parade", "parallelogram", "parcel", "parent", "parentheses", "park", "parrot", "parsnip", "part", "particle", "partner", "partridge", "party", "passbook", "passenger", "passive", "pasta", "paste", "pastor", "pastry", "patch", "path", "patient", "patio", "patricia", "paul", "payment", "pea", "peace", "peak", "peanut", "pear", "pedestrian", "pediatrician", "pelican", "pen", "penalty", "pencil", "pendulum", "pentagon", "pepper", "perch", "perfume", "period", "periodical", "peripheral", "permission", "persian", "person", "peru", "pest", "pet", "pharmacist", "pheasant", "philippines", "philosophy", "phone", "physician", "piano", "piccolo", "pickle", "picture", "pie", "pig", "pigeon", "pike", "pillow", "pilot", "pimple", "pin", "pine", "ping", "pink", "pint", "pipe", "pisces", "pizza", "place", "plain", "plane", "planet", "plant", "plantation", "plaster", "plasterboard", "plastic", "plate", "platinum", "play", "playground", "playroom", "pleasure", "plier", "plot", "plough", "plow", "plywood", "pocket", "poet", "point", "poison", "poland", "police", "policeman", "polish", "politician", "pollution", "polo", "polyester", "pond", "popcorn", "poppy", "population", "porch", "porcupine", "port", "porter", "position", "possibility", "postage", "postbox", "pot", "potato", "poultry", "pound", "powder", "power", "precipitation", "preface", "prepared", "pressure", "price", "priest", "print", "printer", "prison", "probation", "process", "processing", "produce", "product", "production", "professor", "profit", "promotion", "propane", "property", "prose", "prosecution", "protest", "protocol", "pruner", "psychiatrist", "psychology", "puffin", "pull", "puma", "pump", "pumpkin", "punch", "punishment", "puppy", "purchase", "purple", "purpose", "push", "pyjama", "pyramid", "quail", "quality", "quart", "quarter", "quartz", "queen", "question", "quicksand", "quiet", "quill", "quilt", "quit", "quiver", "quotation", "rabbi", "rabbit", "racing", "radar", "radiator", "radio", "radish", "raft", "rail", "railway", "rain", "rainbow", "raincoat", "rainstorm", "rake", "random", "range", "rat", "rate", "raven", "ravioli", "ray", "rayon", "reaction", "reading", "reason", "receipt", "recess", "record", "recorder", "rectangle", "red", "reduction", "refrigerator", "refund", "regret", "reindeer", "relation", "relative", "religion", "relish", "reminder", "repair", "replace", "report", "representative", "request", "resolution", "respect", "responsibility", "rest", "restaurant", "result", "retailer", "revolve", "revolver", "reward", "rhinoceros", "rhythm", "rice", "richard", "riddle", "ring", "rise", "risk", "river", "riverbed", "road", "roadway", "roast", "robert", "robin", "rock", "rocket", "rod", "roll", "romania", "romanian", "ronald", "roof", "room", "rooster", "root", "rose", "rotate", "route", "router", "rowboat", "rub", "rubber", "rugby", "rule", "run", "russia", "russian", "ruth", "sack", "sagittarius", "sail", "sailboat", "sailor", "salad", "salary", "sale", "salesman", "salmon", "salt", "samurai", "sand", "sandra", "sandwich", "santa", "sarah", "sardine", "satin", "saturday", "sauce", "saudi arabia", "sausage", "save", "saw", "saxophone", "scale", "scallion", "scanner", "scarecrow", "scarf", "scene", "scent", "schedule", "school", "science", "scissors", "scooter", "scorpio", "scorpion", "scraper", "screen", "screw", "screwdriver", "sea", "seagull", "seal", "seaplane", "search", "seashore", "season", "seat", "second", "secretary", "secure", "security", "seed", "seeder", "segment", "select", "selection", "self", "sense", "sentence", "separated", "september", "servant", "server", "session", "shade", "shadow", "shake", "shallot", "shame", "shampoo", "shape", "share", "shark", "sharon", "shears", "sheep", "sheet", "shelf", "shell", "shield", "shingle", "ship", "shirt", "shock", "shoe", "shoemaker", "shop", "shorts", "shoulder", "shovel", "show", "shrimp", "shrine", "siamese", "siberian", "side", "sideboard", "sidecar", "sidewalk", "sign", "signature", "silica", "silk", "silver", "sing", "singer", "single", "sink", "sister", "size", "skate", "skiing", "skill", "skin", "skirt", "sky", "slash", "slave", "sled", "sleep", "sleet", "slice", "slime", "slip", "slipper", "slope", "smash", "smell", "smile", "smoke", "snail", "snake", "sneeze", "snow", "snowboarding", "snowflake", "snowman", "snowplow", "snowstorm", "soap", "soccer", "society", "sociology", "sock", "soda", "sofa", "softball", "softdrink", "software", "soil", "soldier", "son", "song", "soprano", "sort", "sound", "soup", "south africa", "south america", "south korea", "soy", "soybean", "space", "spade", "spaghetti", "spain", "spandex", "spark", "sparrow", "spear", "specialist", "speedboat", "sphere", "sphynx", "spider", "spike", "spinach", "spleen", "sponge", "spoon", "spot", "spring", "sprout", "spruce", "spy", "square", "squash", "squid", "squirrel", "stage", "staircase", "stamp", "star", "start", "starter", "state", "statement", "station", "statistic", "steam", "steel", "stem", "step", "steven", "stew", "stick", "stinger", "stitch", "stock", "stocking", "stomach", "stone", "stool", "stop", "stopsign", "stopwatch", "store", "storm", "story", "stove", "stranger", "straw", "stream", "street", "streetcar", "stretch", "string", "structure", "study", "sturgeon", "submarine", "substance", "subway", "success", "sudan", "suede", "sugar", "suggestion", "suit", "summer", "sun", "sunday", "sundial", "sunflower", "sunshine", "supermarket", "supply", "support", "surfboard", "surgeon", "surname", "surprise", "susan", "sushi", "swallow", "swamp", "swan", "sweater", "sweatshirt", "sweatshop", "swedish", "sweets", "swim", "swimming", "swing", "swiss", "switch", "sword", "swordfish", "sycamore", "syria", "syrup", "system", "table", "tablecloth", "tabletop", "tadpole", "tail", "tailor", "taiwan", "talk", "tank", "tanker", "tanzania", "target", "taste", "taurus", "tax", "taxi", "taxicab", "tea", "teacher", "teaching", "team", "technician", "teeth", "television", "temper", "temperature", "temple", "tempo", "tendency", "tennis", "tenor", "tent", "territory", "test", "text", "textbook", "texture", "thailand", "theater", "theory", "thermometer", "thing", "thistle", "thomas", "thought", "thread", "thrill", "throat", "throne", "thumb", "thunder", "thunderstorm", "thursday", "ticket", "tie", "tiger", "tights", "tile", "time", "timer", "tin", "tip", "tire", "titanium", "title", "toad", "toast", "toe", "toenail", "toilet", "tomato", "ton", "tongue", "tooth", "toothbrush", "toothpaste", "top", "tornado", "tortellini", "tortoise", "touch", "tower", "town", "toy", "tractor", "trade", "traffic", "trail", "train", "tramp", "transaction", "transmission", "transport", "trapezoid", "tray", "treatment", "tree", "trial", "triangle", "trick", "trigonometry", "trip", "trombone", "trouble", "trousers", "trout", "trowel", "truck", "trumpet", "trunk", "t-shirt", "tsunami", "tub", "tuba", "tuesday", "tugboat", "tulip", "tuna", "tune", "turkey", "turkish", "turn", "turnip", "turnover", "turret", "turtle", "tv", "twig", "twilight", "twist", "typhoon", "uganda", "ukraine", "ukrainian", "umbrella", "uncle", "underclothes", "underpants", "undershirt", "underwear", "unit", "united kingdom", "unshielded", "use", "utensil", "uzbekistan", "vacation", "vacuum", "valley", "value", "van", "vase", "vault", "vegetable", "vegetarian", "veil", "vein", "velvet", "venezuela", "venezuelan", "verdict", "vermicelli", "verse", "vessel", "vest", "veterinarian", "vietnam", "view", "vinyl", "viola", "violet", "violin", "virgo", "viscose", "vise", "vision", "visitor", "voice", "volcano", "volleyball", "voyage", "vulture", "waiter", "waitress", "walk", "wall", "wallaby", "wallet", "walrus", "war", "warm", "wash", "washer", "wasp", "waste", "watch", "watchmaker", "water", "waterfall", "wave", "wax", "way", "wealth", "weapon", "weasel", "weather", "wedge", "wednesday", "weed", "weeder", "week", "weight", "whale", "wheel", "whip", "whiskey", "whistle", "white", "wholesaler", "wilderness", "william", "willow", "wind", "windchime", "window", "windscreen", "windshield", "wine", "wing", "winter", "wire", "wish", "witch", "withdrawal", "witness", "wolf", "woman", "women", "wood", "wool", "woolen", "word", "work", "workshop", "worm", "wound", "wren", "wrench", "wrinkle", "wrist", "writer", "xylophone", "yacht", "yak", "yam", "yard", "yarn", "year", "yellow", "yew", "yogurt", "yoke", "yugoslavian", "zebra", "zephyr", "zinc", "zipper", "zone", "zoo"];
        return i
    }
]), angular.module("app.services.countdown", ["underscore"]).factory("$countdown", ["$rootScope", "$log", "$timeout", "_",
    function(e, t, n, r) {
        e.$on("$routeChangeStart", function() {
            i.killAll()
        });
        var i = {
            countdowns: [],
            registerCountdown: function(t, i, o) {
                var a = {
                    id: t || Math.random(),
                    countdownStep: o || 1e3,
                    timeoutId: null,
                    duration: i,
                    counter: i,
                    onCount: function() {
                        var t = a;
                        t.counter > 0 ? (t.counter--, t.timeoutId = n(t.onCount, t.countdownStep), e.$broadcast("countdown", {
                            id: t.id,
                            timeLeft: t.counter
                        })) : t.stop()
                    },
                    stop: function(t) {
                        t = "undefined" != typeof t ? t : !0;
                        var r = a;
                        r.timeoutId && (n.cancel(r.timeoutId), r.timeoutId = null, t && e.$broadcast("countdownStopped", {
                            id: r.id,
                            timeLeft: r.counter
                        }))
                    },
                    start: function() {
                        var t = a;
                        t.timeoutId = n(t.onCount, t.countdownStep), e.$broadcast("countdownStarted", {
                            id: t.id,
                            timeLeft: t.counter
                        })
                    },
                    reset: function() {
                        var e = a;
                        e.counter = i
                    },
                    restart: function(e) {
                        var t = a;
                        t.stop(e), t.reset(), t.start()
                    }
                }, s = r.find(this.countdowns, function(e) {
                    return e.id === a.id
                });
                return s ? (s.stop(), s.countdownStep = a.countdownStep, s.duration = a.duration, s.counter = a.counter, s) : (this.countdowns.push(a), a)
            },
            killAll: function() {
                var e = i;
                r.each(e.countdowns, function(e) {
                    e.stop(!1)
                })
            }
        };
        return i
    }
]), angular.module("underscore", []).factory("_", [
    function() {
        return _ || void 0
    }
]), angular.module("app.services.preloader", ["underscore"]).factory("$preloader", ["_", "$log", "$timeout", "$rootScope",
    function(e, t, n, r) {
        function i(e, t, r, i, o) {
            var a = 0;
            ! function() {
                var s = t.length - a,
                    c = s >= r ? r : s;
                if (a < t.length) {
                    for (; c--;) e(t[a++]);
                    n(arguments.callee, i)
                } else o && o()
            }()
        }

        function o(e, n) {
            var r = 0;
            i(function(i) {
                n[i] = new Image, n[i].onload = function() {
                    r++, t.log("Preloaded " + i + " (" + r + " of " + e.length + ")."), a(r, e.length)
                }, n[i].src = i
            }, e, 1, 250, function() {
                t.log("Preloading complete."), a(r, e.length, !0)
            })
        }

        function a(e, t, n) {
            n ? r.$broadcast("imageLoadingComplete", {
                loaded: e,
                of: t,
                progress: 100
            }) : r.$broadcast("imageLoaded", {
                loaded: e,
                of: t,
                progress: Math.round(e / t * 100)
            })
        }
        var s = {
            fetchImages: function(n, r) {
                r && (n = e.map(n, function(e) {
                    return r + e
                }));
                var i = e.uniq(n);
                i = e.compact(i), t.log("Preloading " + i.length + " images..."), i.length > 0 && o(e.uniq(i), [])
            }
        };
        return s
    }
]), angular.module("app.services.session", []).factory("$session", ["$config", "$location", "$rootScope", "$log", "$http", "$authentication",
    function(e, t, n, r, i, o) {
        function a() {
            return e.session.api ? i.post(e.session.api + "/?" + (new Date).getTime(), null, {
                headers: o.oAuthHeaders(),
                transformResponse: function(e) {
                    return angular.fromJson(e)
                }
            }) : (r.log("No reservation server API"), null)
        }
        var s = {
            reserve: function(e, t) {
                var n = a();
                n && n.success(function(t) {
                    e(t)
                }).error(t)
            },
            exists: function(t, n) {
                var r = e.session.api + "/test/" + t + "/?" + (new Date).getTime(),
                    a = i.get(r, {
                        headers: o.oAuthHeaders()
                    });
                return a.success(function(e, t) {
                    n && ("true" === e ? n(!0, t) : n(!1, t))
                }), a.error(function(e, t) {
                    n && n(!1, t)
                }), a
            }
        };
        return s
    }
]), angular.module("app.services.random", []).factory("$random", [
    function() {
        function e(e, t) {
            var o = [];
            return e = i(r(t ? [e, a] : arguments.length ? e : [(new Date).getTime(), a, window], 3), o), p = new n(o), i(p.S, a), e
        }

        function t() {
            for (var e = p.g(c), t = d, n = 0; l > e;) e = (e + n) * s, t *= s, n = p.g(1);
            for (; e >= u;) e /= 2, t /= 2, n >>>= 1;
            return (e + n) / t
        }

        function n(e) {
            var t, n, r = this,
                i = e.length,
                a = 0,
                c = r.i = r.j = r.m = 0;
            for (r.S = [], r.c = [], i || (e = [i++]); s > a;) r.S[a] = a++;
            for (a = 0; s > a; a++) t = r.S[a], c = o(c + t + e[a % i]), n = r.S[c], r.S[a] = n, r.S[c] = t;
            r.g = function(e) {
                var t = r.S,
                    n = o(r.i + 1),
                    i = t[n],
                    a = o(r.j + i),
                    c = t[a];
                t[n] = c, t[a] = i;
                for (var l = t[o(i + c)]; --e;) n = o(n + 1), i = t[n], a = o(a + i), c = t[a], t[n] = c, t[a] = i, l = l * s + t[o(i + c)];
                return r.i = n, r.j = a, l
            }, r.g(s)
        }

        function r(e, t, n, i, o) {
            if (n = [], o = typeof e, t && "object" == o)
                for (i in e)
                    if (i.indexOf("S") < 5) try {
                        n.push(r(e[i], t - 1))
                    } catch (a) {}
            return n.length ? n : e + ("string" != o ? "\x00" : "")
        }

        function i(e, t, n, r) {
            for (e += "", n = 0, r = 0; r < e.length; r++) t[o(r)] = o((n ^= 19 * t[o(r)]) + e.charCodeAt(r));
            e = "";
            for (r in t) e += String.fromCharCode(t[r]);
            return e
        }

        function o(e) {
            return e & s - 1
        }
        var a = [],
            s = 256,
            c = 6,
            l = Math.pow(2, 52),
            u = 2 * l,
            d = Math.pow(s, c),
            f = [],
            p = null;
        i(Math.random(), a);
        var h = {
            seed: function(t, n) {
                return e(t, n)
            },
            random: function() {
                return t()
            },
            pushseed: function() {},
            popseed: function() {
                return f.length ? f.pop() : null
            }
        };
        return h
    }
]), angular.module("app.services.lang", ["ngResource", "underscore"]).factory("$lang", ["$rootScope", "$resource", "$timeout",
    function(e, t) {
        var n = {
            language: "en_gb",
            setLanguage: function(e) {
                n.language = e
            },
            getContent: function() {
                var r = t("/theme/lang/" + n.language + ".json"),
                    i = {};
                r.get(function(t) {
                    for (var n in t) {
                        var r = t[n];
                        "$" != n.substring(0, 1) && (i[n] = r)
                    }
                    e.siteAppContent = i, e.$broadcast("loadContentSuccess")
                }, function() {
                    e.$broadcast("loadContentFailed")
                })
            }
        };
        return n
    }
]), angular.module("app.services.quiz", ["underscore"]).factory("$quiz", ["$config", "$log", "$http", "_", "$authentication", "$q",
    function(e, t, n, r, i, o) {
        function a(t) {
            return e.usergrid.server + "/kahoots/" + t + "?_=" + (new Date).getTime()
        }

        function s(t) {
            var o = a(t);
            return n.get(o, {
                headers: i.oAuthHeaders(),
                transformResponse: function(t) {
                    var n = angular.fromJson(t);
                    return n.cover = e.mapImageUrl(n.cover), r.each(n.questions, function(t) {
                        t.image = e.mapImageUrl(t.image)
                    }), n
                }
            })
        }
        var c = {
            all: function() {
                return s()
            },
            byId: function(e, t, n) {
                s(e).success(function(e) {
                    var n = e;
                    t(n)
                }).error(n)
            },
            byIdList: function(e) {
                return o.all(r.map(e, function(e) {
                    return s(e)
                }))
            },
            favouriteQuiz: function(t, r, o) {
                if (i.currentUser()) {
                    var a = e.usergrid.server + "/users/" + i.currentUser().uuid + "/favourites/kahoot/" + t;
                    n.post(a, null, {
                        headers: i.oAuthHeaders()
                    }).success(function() {
                        r()
                    }).error(o)
                }
            },
            coverImageOrPlaceholder: function(t) {
                return t.cover ? e.mapImageUrl(t.cover) : "//kahoot-static-assets.s3.amazonaws.com/covers/placeholder_cover_" + (t.quizType || "quiz") + ".jpg"
            },
            quizTypes: {
                quiz: {
                    showTitle: !0,
                    showQuestionNumbers: !0,
                    showScore: !0,
                    showRank: !0,
                    showRandomise: !0,
                    showSocial: !0,
                    pointQuestions: !0,
                    pointlessQuestions: !0
                },
                survey: {
                    showTitle: !0,
                    showQuestionNumbers: !0,
                    showScore: !1,
                    showRank: !1,
                    showRandomise: !1,
                    showSocial: !1,
                    pointQuestions: !1,
                    pointlessQuestions: !0
                },
                poll: {
                    showTitle: !1,
                    showQuestionNumbers: !1,
                    showScore: !1,
                    showRank: !1,
                    showRandomise: !1,
                    showSocial: !0,
                    pointQuestions: !1,
                    pointlessQuestions: !0
                }
            }
        };
        return c
    }
]), angular.module("app.services.ios7fixes", ["ng"]).factory("$ios7fixes", ["$window",
    function(e) {
        return e.navigator.userAgent.match(/iPad;.*CPU.*OS 7_\d/i) && $("html").addClass("ipad ios7"), e.navigator.userAgent.indexOf("CriOS") >= 0 && $("html").addClass("chromeios"), e.navigator.standalone && $("html").addClass("standalone"), null
    }
]), angular.module("app.services.lq.analytics", ["ng"]).factory("$analytics", ["$rootScope", "$window", "$location",
    function(e, t) {
        function n() {
            var e = t.document.location.pathname + t.document.location.search + t.document.location.hash; - 1 == e.toLowerCase().indexOf("token") && (t._gaq && t._gaq.push(["_trackPageview", e]), t.ga && t.ga("send", "pageview", e))
        }

        function r(e, n, r, i) {
            t._gaq && t._gaq.push(["_trackEvent", e, n, r, i]), t.ga && t.ga("send", "event", e, n, r, i)
        }

        function i(e, n, r) {
            var i = 1;
            t._gaq && t._gaq.push(["_trackEvent", "connection", n, angular.toJson(r), i]), t.ga && t.ga("send", "event", "connection." + e, n, angular.toJson(r), i, {
                nonInteraction: 1
            })
        }
        var o = {
            trackCurrentPage: function() {
                n()
            },
            trackCustom: function(e, t, n, i) {
                r(e, t, n, i)
            },
            trackConnection: i
        };
        return o
    }
]), angular.module("app.directives.loader", []).directive("loader", function() {
    return {
        link: function(e, t) {
            t.css("display", "none")
        }
    }
}), angular.module("app.directives.debug", ["app.services.network", "app.services.config", "underscore"]).directive("debugInfo", ["$config", "$network", "_",
    function(e, t, n) {
        return {
            link: function(r, i, o) {
                function a(e, t) {
                    var n = i,
                        r = '<span class="seq">[T' + c() + "]</span> ",
                        o = $('<p class="debug-msg">' + (u ? r : "") + e + "</p>");
                    o.css("opacity", 0), t && n.html("");
                    var a = $("p", i[0]).length;
                    a >= d && $($("p", i[0])[0]).remove(), n.append(o), o.animate({
                        opacity: 1
                    }, 600)
                }

                function s(e, t) {
                    for (var n = "" + e; n.length < t;) n = "0" + n;
                    return n
                }

                function c() {
                    var e = new Date,
                        t = s(e.getHours(), 2),
                        n = s(e.getMinutes(), 2),
                        r = s(e.getSeconds(), 2),
                        i = s(e.getMilliseconds(), 3),
                        o = t + ":" + n + ":" + r + ":" + i;
                    return o
                }
                var l = [],
                    u = "string" == typeof o.debugTimestamp || !1,
                    d = parseInt(o.maxRows);
                isNaN(d) && (d = 3), "string" == typeof o.debugInfo && o.debugInfo.length > 0 && (l = o.debugInfo.split(","));
                var f = l.length > 0 && n.some(l, function(t) {
                    return t === e.environment
                });
                f && (i.css("display", "block"), a("Debug info enabled..."), a("Env: " + e.environment), r.$on(t.events.lagUpdate, function() {
                    a("Lag: " + t.getLag() + "ms")
                }), r.$on("debug", function(e, t) {
                    a("Debug: " + t)
                }))
            }
        }
    }
]), angular.module("app.directives.notifications", []).directive("alerts", ["$timeout",
    function(e) {
        function t(e, t, n, r) {
            return "<div id=" + n + ' class="alert ' + e + '">' + (r ? '<div class="close_icon"></div>' : "") + '<i class="icon"></i><div class="msg">' + t + '</div><span class="logo"></span></div>'
        }

        function n(e) {
            return '<div id="waitOverlay" class="alert-fullscreen valignwrapper"><div class="alert-spinner valign"><div class="spinner"></div><div class="spinner-message">' + e + "</div></div></div>"
        }
        var r = {
                error: "alert-error",
                info: "alert-info",
                warning: "",
                success: "alert-success"
            }, i = 0,
            o = 0,
            a = {};
        return {
            link: function(s, c, l) {
                var u = parseInt(l.fadeDuration);
                isNaN(u) && (u = 500);
                var d = parseInt(l.slideDuration);
                isNaN(d) && (d = 250), s.$on("clearWait", function(e, t) {
                    if (!i || t && t.level && t.level >= i) {
                        i = 0;
                        var n = $("#waitOverlay", c[0]).animate({
                            opacity: 0
                        }, u, "linear", function() {
                            n.remove()
                        })
                    }
                }), s.$on("dismissAlert", function(e, t) {
                    var n = $("#" + t.key, c[0]).animate({
                        opacity: 0
                    }, u, "linear", function() {
                        n.remove()
                    })
                }), s.$on("dismissAllNotifications", function(e, t) {
                    if (s.$broadcast("clearWait"), !o || t && t.level && t.level >= o) {
                        o = 0;
                        var n = $(".alert", c[0]).animate({
                            opacity: 0
                        }, u, "linear", function() {
                            n.remove()
                        })
                    }
                }), s.$on("wait", function(e, t) {
                    var r = c[0],
                        o = "#waitOverlay";
                    if (t.level && i < t.level && (i = t.level), 0 == $(o, r).length || $(o, r).css("opacity") < 1) {
                        var a = $(n(t.message)),
                            s = new Spinner(kahoot.theme.current.controller.spinner).spin();
                        a.find(".spinner").append(s.el), c.prepend(a)
                    } else {
                        var l = $(o + " .spinner-message", r);
                        l.html(t.message)
                    }
                }), s.$on("alert", function(n, i) {
                    if (0 == $("#" + i.key, c[0]).length || $("#" + i.key, c[0]).css("opacity") < 1) {
                        i.level && o < i.level && (o = i.level);
                        var s = 99999,
                            l = $(t(r[i.alertType], i.message, i.key, i.userDismissable));
                        i.level > 0 ? l.css("z-index", s + i.level) : l.css("z-index", s + 1), c.append(l), i.logo && l.addClass("with-logo"), l.css("bottom", -(l.height() + 10)), l.animate({
                            bottom: 0
                        }, d, easings.easeOut), i.userDismissable && l.bind("click", function() {
                            var e = $(this);
                            e.animate({
                                opacity: 0
                            }, u, "linear", function() {
                                e.remove()
                            })
                        })
                    } else {
                        var l = $("#" + i.key, c[0]);
                        i.logo && l.addClass("with-logo"), l.find(".msg").text(i.message)
                    } if (i.autoDismiss) {
                        var l = l || $("#" + i.key),
                            f = i.autoDismiss.delay || 4e3;
                        a[i.key] && e.cancel(a[i.key]), a[i.key] = e(function() {
                            l.animate({
                                opacity: 0
                            }, u, "linear", function() {
                                l.remove(), delete a[i.key]
                            })
                        }, f)
                    } else a[i.key] && e.cancel(a[i.key])
                })
            }
        }
    }
]), angular.module("app.directives.blocking", []).directive("blocking", function() {
    return function(e, t, n) {
        var r = "disabled";
        e.$on("busy", function() {
            t.hasClass(r) || (t.addClass(r), t.prop("disabled", !0), "" !== n.blocking && (e.prevHtml = t.html(), t.html(n.blocking)))
        }), e.$on("free", function() {
            t.removeClass(r), t.prop("disabled", !1), e.prevHtml && t.html(e.prevHtml)
        })
    }
}), angular.module("app.directives.placeholder", []).directive("placeholder", ["$rootScope",
    function() {
        return function(e, t) {
            $(t).placeholder()
        }
    }
]), angular.module("app.services.sanitize", []).value("sanitize", mobitroll.sanitize), angular.module("app.directives.sanitize", ["app.services.sanitize"]).directive("bindHtml", ["sanitize",
    function(e) {
        return function(t, n, r) {
            n.addClass("ng-binding").data("$binding", r.bindHtml), t.$watch(r.bindHtml, function(t) {
                t = e ? e.removeDangerousTags(t) : "", n.html(t || "")
            })
        }
    }
]).directive("bindHtmlEscaped", ["sanitize",
    function(e) {
        return function(t, n, r) {
            n.addClass("ng-binding").data("$binding", r.bindHtml), t.$watch(r.bindHtmlEscaped, function(t) {
                t = e ? e.escapeTags(t) : "", n.html(t || "")
            })
        }
    }
]), ! function(e, t, n) {
    function r(e, n) {
        var r, i = t.createElement(e || "div");
        for (r in n) i[r] = n[r];
        return i
    }

    function i(e) {
        for (var t = 1, n = arguments.length; n > t; t++) e.appendChild(arguments[t]);
        return e
    }

    function o(e, t, n, r) {
        var i = ["opacity", t, ~~ (100 * e), n, r].join("-"),
            o = .01 + n / r * 100,
            a = Math.max(1 - (1 - e) / t * (100 - o), e),
            s = d.substring(0, d.indexOf("Animation")).toLowerCase(),
            c = s && "-" + s + "-" || "";
        return p[i] || (h.insertRule("@" + c + "keyframes " + i + "{0%{opacity:" + a + "}" + o + "%{opacity:" + e + "}" + (o + .01) + "%{opacity:1}" + (o + t) % 100 + "%{opacity:" + e + "}100%{opacity:" + a + "}}", h.cssRules.length), p[i] = 1), i
    }

    function a(e, t) {
        var r, i, o = e.style;
        if (o[t] !== n) return t;
        for (t = t.charAt(0).toUpperCase() + t.slice(1), i = 0; i < f.length; i++)
            if (r = f[i] + t, o[r] !== n) return r
    }

    function s(e, t) {
        for (var n in t) e.style[a(e, n) || n] = t[n];
        return e
    }

    function c(e) {
        for (var t = 1; t < arguments.length; t++) {
            var r = arguments[t];
            for (var i in r) e[i] === n && (e[i] = r[i])
        }
        return e
    }

    function l(e) {
        for (var t = {
            x: e.offsetLeft,
            y: e.offsetTop
        }; e = e.offsetParent;) t.x += e.offsetLeft, t.y += e.offsetTop;
        return t
    }

    function u(e) {
        return this.spin ? void(this.opts = c(e || {}, u.defaults, g)) : new u(e)
    }
    var d, f = ["webkit", "Moz", "ms", "O"],
        p = {}, h = function() {
            var e = r("style", {
                type: "text/css"
            });
            return i(t.getElementsByTagName("head")[0], e), e.sheet || e.styleSheet
        }(),
        g = {
            lines: 12,
            length: 7,
            width: 5,
            radius: 10,
            rotate: 0,
            corners: 1,
            color: "#000",
            speed: 1,
            trail: 100,
            opacity: .25,
            fps: 20,
            zIndex: 2e9,
            className: "spinner",
            top: "auto",
            left: "auto",
            position: "relative"
        };
    u.defaults = {}, c(u.prototype, {
        spin: function(e) {
            this.stop();
            var t, n, i = this,
                o = i.opts,
                a = i.el = s(r(0, {
                    className: o.className
                }), {
                    position: o.position,
                    width: 0,
                    zIndex: o.zIndex
                }),
                c = o.radius + o.length + o.width;
            if (e && (e.insertBefore(a, e.firstChild || null), n = l(e), t = l(a), s(a, {
                left: ("auto" == o.left ? n.x - t.x + (e.offsetWidth >> 1) : parseInt(o.left, 10) + c) + "px",
                top: ("auto" == o.top ? n.y - t.y + (e.offsetHeight >> 1) : parseInt(o.top, 10) + c) + "px"
            })), a.setAttribute("aria-role", "progressbar"), i.lines(a, i.opts), !d) {
                var u = 0,
                    f = o.fps,
                    p = f / o.speed,
                    h = (1 - o.opacity) / (p * o.trail / 100),
                    g = p / o.lines;
                ! function m() {
                    u++;
                    for (var e = o.lines; e; e--) {
                        var t = Math.max(1 - (u + e * g) % p * h, o.opacity);
                        i.opacity(a, o.lines - e, t, o)
                    }
                    i.timeout = i.el && setTimeout(m, ~~ (1e3 / f))
                }()
            }
            return i
        },
        stop: function() {
            var e = this.el;
            return e && (clearTimeout(this.timeout), e.parentNode && e.parentNode.removeChild(e), this.el = n), this
        },
        lines: function(e, t) {
            function n(e, n) {
                return s(r(), {
                    position: "absolute",
                    width: t.length + t.width + "px",
                    height: t.width + "px",
                    background: e,
                    boxShadow: n,
                    transformOrigin: "left",
                    transform: "rotate(" + ~~(360 / t.lines * c + t.rotate) + "deg) translate(" + t.radius + "px,0)",
                    borderRadius: (t.corners * t.width >> 1) + "px"
                })
            }
            for (var a, c = 0; c < t.lines; c++) a = s(r(), {
                position: "absolute",
                top: 1 + ~(t.width / 2) + "px",
                transform: t.hwaccel ? "translate3d(0,0,0)" : "",
                opacity: t.opacity,
                animation: d && o(t.opacity, t.trail, c, t.lines) + " " + 1 / t.speed + "s linear infinite"
            }), t.shadow && i(a, s(n("#000", "0 0 4px #000"), {
                top: "2px"
            })), i(e, i(a, n(t.color, "0 0 1px rgba(0,0,0,.1)")));
            return e
        },
        opacity: function(e, t, n) {
            t < e.childNodes.length && (e.childNodes[t].style.opacity = n)
        }
    }),
        function() {
            function e(e, t) {
                return r("<" + e + ' xmlns="urn:schemas-microsoft.com:vml" class="spin-vml">', t)
            }
            var t = s(r("group"), {
                behavior: "url(#default#VML)"
            });
            !a(t, "transform") && t.adj ? (h.addRule(".spin-vml", "behavior:url(#default#VML)"), u.prototype.lines = function(t, n) {
                function r() {
                    return s(e("group", {
                        coordsize: l + " " + l,
                        coordorigin: -c + " " + -c
                    }), {
                        width: l,
                        height: l
                    })
                }

                function o(t, o, a) {
                    i(d, i(s(r(), {
                        rotation: 360 / n.lines * t + "deg",
                        left: ~~o
                    }), i(s(e("roundrect", {
                        arcsize: n.corners
                    }), {
                        width: c,
                        height: n.width,
                        left: n.radius,
                        top: -n.width >> 1,
                        filter: a
                    }), e("fill", {
                        color: n.color,
                        opacity: n.opacity
                    }), e("stroke", {
                        opacity: 0
                    }))))
                }
                var a, c = n.length + n.width,
                    l = 2 * c,
                    u = 2 * -(n.width + n.length) + "px",
                    d = s(r(), {
                        position: "absolute",
                        top: u,
                        left: u
                    });
                if (n.shadow)
                    for (a = 1; a <= n.lines; a++) o(a, -2, "progid:DXImageTransform.Microsoft.Blur(pixelradius=2,makeshadow=1,shadowopacity=.3)");
                for (a = 1; a <= n.lines; a++) o(a);
                return i(t, d)
            }, u.prototype.opacity = function(e, t, n, r) {
                var i = e.firstChild;
                r = r.shadow && r.lines || 0, i && t + r < i.childNodes.length && (i = i.childNodes[t + r], i = i && i.firstChild, i = i && i.firstChild, i && (i.opacity = n))
            }) : d = a(t, "animation")
        }(), "function" == typeof define && define.amd ? define(function() {
        return u
    }) : e.Spinner = u
}(window, document),
    function(e, t) {
        "use strict";

        function n(e) {
            return new r(e)
        }

        function r(e) {
            return e && e._wrapped ? e : void(this._wrapped = e)
        }

        function i() {
            for (var e, t, n, r = -1, i = arguments.length, o = {
                bottom: "",
                exit: "",
                init: "",
                top: "",
                arrayBranch: {
                    beforeLoop: "",
                    loopExp: "++index < length"
                },
                objectBranch: {
                    beforeLoop: ""
                }
            }; ++r < i;) {
                e = arguments[r];
                for (t in e) n = null == (n = e[t]) ? "" : n, /beforeLoop|loopExp|inLoop/.test(t) ? ("string" == typeof n && (n = {
                    array: n,
                    object: n
                }), o.arrayBranch[t] = n.array, o.objectBranch[t] = n.object) : o[t] = n
            }
            var a = o.args,
                s = o.arrayBranch,
                l = o.objectBranch,
                u = /^[^,]+/.exec(a)[0],
                d = l.loopExp,
                f = /\S+$/.exec(d || u)[0];
            o.firstArg = u, o.hasDontEnumBug = St, o.hasExp = "hasOwnProperty.call(" + f + ", index)", o.iteratedObject = f, o.shadowed = Mt, o.useHas = o.useHas !== !1, o.exit || (o.exit = "if (!" + u + ") return result"), "object" != u && s.inLoop || (o.arrayBranch = null), d || (l.loopExp = "index in " + f);
            var p = Function("arrayClass, funcClass, hasOwnProperty, identity, iteratorBind, objectTypes, stringClass, toString, undefined", '"use strict"; return function(' + a + ") {\n" + ln(o) + "\n}");
            return p(Ht, Wt, Yt, gt, c, Rt, Xt, tn)
        }

        function o(e, t) {
            return Dt[t]
        }

        function a(e) {
            return "\\" + zt[e]
        }

        function s(e) {
            return Ft[e]
        }

        function c(e, t) {
            return function(n, r, i) {
                return e.call(t, n, r, i)
            }
        }

        function l() {}

        function u(e, t) {
            var n = Dt.length;
            return Dt[n] = "'+\n_.escape(" + t + ") +\n'", It + n
        }

        function d(e, t) {
            var n = Dt.length;
            return Dt[n] = "'+\n((__t = (" + t + ")) == null ? '' : __t) +\n'", It + n
        }

        function f(e, t) {
            var n = Dt.length;
            return Dt[n] = "';\n" + t + ";\n__p += '", It + n
        }

        function p(e, t, n, r) {
            if (!e) return n;
            var i = e.length,
                o = arguments.length < 3;
            if (r && (t = c(t, r)), i === i >>> 0) {
                for (i && o && (n = e[--i]); i--;) n = t(n, e[i], i, e);
                return n
            }
            var a, s = On(e);
            for (i = s.length, i && o && (n = e[s[--i]]); i--;) a = s[i], n = t(n, e[a], a, e);
            return n
        }

        function h(e) {
            if (!e) return [];
            if (tn.call(e.toArray) == Wt) return e.toArray();
            var t = e.length;
            return t === t >>> 0 ? en.call(e) : In(e)
        }

        function g(e) {
            var t = [];
            if (!e) return t;
            for (var n = -1, r = e.length; ++n < r;) e[n] && t.push(e[n]);
            return t
        }

        function m(e) {
            var t = [];
            if (!e) return t;
            for (var n = -1, r = e.length, i = Qt.apply(t, en.call(arguments, 1)); ++n < r;) $(i, e[n]) < 0 && t.push(e[n]);
            return t
        }

        function v(e, n, r) {
            return e ? n == t || r ? e[0] : en.call(e, 0, n) : void 0
        }

        function y(e, t) {
            var n = [];
            if (!e) return n;
            for (var r, i = -1, o = e.length; ++i < o;) r = e[i], qn(r) ? Zt.apply(n, t ? r : y(r)) : n.push(r);
            return n
        }

        function b(e, t, n) {
            var r = {};
            if (!e) return r;
            var i, o, a = -1,
                s = "function" == typeof t,
                l = e.length;
            for (s && n && (t = c(t, n)); ++a < l;) o = e[a], i = s ? t(o, a, e) : o[t], (Yt.call(r, i) ? r[i] : r[i] = []).push(o);
            return r
        }

        function $(e, t, n) {
            if (!e) return -1;
            var r = -1,
                i = e.length;
            if (n) {
                if ("number" != typeof n) return r = M(e, t), e[r] === t ? r : -1;
                r = (0 > n ? Math.max(0, i + n) : n) - 1
            }
            for (; ++r < i;)
                if (e[r] === t) return r;
            return -1
        }

        function w(e, n, r) {
            return e ? en.call(e, 0, -(n == t || r ? 1 : n)) : []
        }

        function k(e) {
            var t = [];
            if (!e) return t;
            for (var n, r = -1, i = e.length, o = en.call(arguments, 1); ++r < i;) n = e[r], $(t, n) < 0 && yn(o, function(e) {
                return $(e, n) > -1
            }) && t.push(n);
            return t
        }

        function x(e, t) {
            var n = [];
            if (!e) return n;
            for (var r = en.call(arguments, 2), i = -1, o = e.length, a = "function" == typeof t; ++i < o;) n[i] = (a ? t : e[i][t]).apply(e[i], r);
            return n
        }

        function T(e, n, r) {
            if (e) {
                var i = e.length;
                return n == t || r ? e[i - 1] : en.call(e, -n || i)
            }
        }

        function C(e, t, n) {
            if (!e) return -1;
            var r = e.length;
            for (n && "number" == typeof n && (r = (0 > n ? Math.max(0, r + n) : Math.min(n, r - 1)) + 1); r--;)
                if (e[r] === t) return r;
            return -1
        }

        function S(e, t, n) {
            var r = -1 / 0,
                i = r;
            if (!e) return i;
            var o, a = -1,
                s = e.length;
            if (!t) {
                for (; ++a < s;) e[a] > i && (i = e[a]);
                return i
            }
            for (n && (t = c(t, n)); ++a < s;) o = t(e[a], a, e), o > r && (r = o, i = e[a]);
            return i
        }

        function A(e, t, n) {
            var r = 1 / 0,
                i = r;
            if (!e) return i;
            var o, a = -1,
                s = e.length;
            if (!t) {
                for (; ++a < s;) e[a] < i && (i = e[a]);
                return i
            }
            for (n && (t = c(t, n)); ++a < s;) o = t(e[a], a, e), r > o && (r = o, i = e[a]);
            return i
        }

        function E(e, t) {
            if (!e) return [];
            for (var n = -1, r = e.length, i = Array(r); ++n < r;) i[n] = e[n][t];
            return i
        }

        function N(e, t, n) {
            n || (n = 1), arguments.length < 2 && (t = e || 0, e = 0);
            for (var r = -1, i = Math.max(Math.ceil((t - e) / n), 0), o = Array(i); ++r < i;) o[r] = e, e += n;
            return o
        }

        function j(e, n, r) {
            return e ? en.call(e, n == t || r ? 1 : n) : []
        }

        function _(e) {
            if (!e) return [];
            for (var t, n = -1, r = e.length, i = Array(r); ++n < r;) t = Math.floor(Math.random() * (n + 1)), i[n] = i[t], i[t] = e[n];
            return i
        }

        function q(e, n, r) {
            if (!e) return [];
            if ("string" == typeof n) {
                var i = n;
                n = function(e) {
                    return e[i]
                }
            } else r && (n = c(n, r));
            for (var o = -1, a = e.length, s = Array(a); ++o < a;) s[o] = {
                criteria: n(e[o], o, e),
                value: e[o]
            };
            for (s.sort(function(e, n) {
                var r = e.criteria,
                    i = n.criteria;
                return r === t ? 1 : i === t ? -1 : i > r ? -1 : r > i ? 1 : 0
            }); a--;) s[a] = s[a].value;
            return s
        }

        function M(e, t, n, r) {
            if (!e) return 0;
            var i, o = 0,
                a = e.length;
            if (n)
                for (t = n.call(r, t); a > o;) i = o + a >>> 1, n.call(r, e[i]) < t ? o = i + 1 : a = i;
            else
                for (; a > o;) i = o + a >>> 1, e[i] < t ? o = i + 1 : a = i;
            return o
        }

        function O() {
            for (var e = -1, t = [], n = Qt.apply(t, arguments), r = n.length; ++e < r;) $(t, n[e]) < 0 && t.push(n[e]);
            return t
        }

        function I(e, t, n, r) {
            var i = [];
            if (!e) return i;
            var o, a = -1,
                s = e.length,
                l = [];
            for ("function" == typeof t && (r = n, n = t, t = !1), n ? r && (n = c(n, r)) : n = gt; ++a < s;) o = n(e[a], a, e), (t ? !a || l[l.length - 1] !== o : $(l, o) < 0) && (l.push(o), i.push(e[a]));
            return i
        }

        function D(e) {
            var t = [];
            if (!e) return t;
            for (var n = en.call(arguments, 1), r = -1, i = e.length; ++r < i;) $(n, e[r]) < 0 && t.push(e[r]);
            return t
        }

        function L(e) {
            if (!e) return [];
            for (var t = -1, n = S(E(arguments, "length")), r = Array(n); ++t < n;) r[t] = E(arguments, t);
            return r
        }

        function P(e, t) {
            return 1 > e ? t() : function() {
                return --e < 1 ? t.apply(this, arguments) : void 0
            }
        }

        function F(e, t) {
            function n() {
                var a = arguments,
                    s = t;
                if (i || (e = t[r]), o.length && (a = a.length ? Qt.apply(o, a) : o), this instanceof n) {
                    l.prototype = e.prototype, s = new l;
                    var c = e.apply(s, a);
                    return Rt[typeof c] && null !== c ? c : s
                }
                return e.apply(s, a)
            }
            var r, i = tn.call(e) == Wt;
            if (i) {
                if (nn) return nn.call.apply(nn, arguments)
            } else r = t, t = e;
            var o = en.call(arguments, 2);
            return n
        }

        function R(e) {
            var t = arguments,
                n = 1;
            1 == t.length && (n = 0, t = jn(e));
            for (var r = t.length; r > n; n++) e[t[n]] = F(e[t[n]], e);
            return e
        }

        function z() {
            var e = arguments;
            return function() {
                for (var t = arguments, n = e.length; n--;) t = [e[n].apply(this, t)];
                return t[0]
            }
        }

        function H(e, n, r) {
            function i() {
                c = t, r || e.apply(s, o)
            }
            var o, a, s, c;
            return function() {
                var t = r && !c;
                return o = arguments, s = this, sn(c), c = cn(i, n), t && (a = e.apply(s, o)), a
            }
        }

        function B(e, n) {
            var r = en.call(arguments, 2);
            return cn(function() {
                return e.apply(t, r)
            }, n)
        }

        function U(e) {
            var n = en.call(arguments, 1);
            return cn(function() {
                return e.apply(t, n)
            }, 1)
        }

        function W(e, t) {
            var n = {};
            return function() {
                var r = t ? t.apply(this, arguments) : arguments[0];
                return Yt.call(n, r) ? n[r] : n[r] = e.apply(this, arguments)
            }
        }

        function V(e) {
            var t, n = !1;
            return function() {
                return n ? t : (n = !0, t = e.apply(this, arguments))
            }
        }

        function J(e) {
            var t = en.call(arguments, 1),
                n = t.length;
            return function() {
                var r, i = arguments;
                return i.length && (t.length = n, Zt.apply(t, i)), r = 1 == t.length ? e.call(this, t[0]) : e.apply(this, t), t.length = n, r
            }
        }

        function X(e, n) {
            function r() {
                c = new Date, s = t, e.apply(a, i)
            }
            var i, o, a, s, c = 0;
            return function() {
                var t = new Date,
                    l = n - (t - c);
                return i = arguments, a = this, 0 >= l ? (c = t, o = e.apply(a, i)) : s || (s = cn(r, l)), o
            }
        }

        function G(e, t) {
            return function() {
                var n = [e];
                return arguments.length && Zt.apply(n, arguments), t.apply(this, n)
            }
        }

        function K(e) {
            return Rt[typeof e] && null !== e ? qn(e) ? e.slice() : An({}, e) : e
        }

        function Q(e, t) {
            return Yt.call(e, t)
        }

        function Y(e) {
            return e === !0 || e === !1 || tn.call(e) == Bt
        }

        function Z(e) {
            return tn.call(e) == Ut
        }

        function et(e) {
            return !(!e || 1 != e.nodeType)
        }

        function tt(e, n, r) {
            if (r || (r = []), e === n) return 0 !== e || 1 / e == 1 / n;
            if (e == t || n == t) return e === n;
            if (e._chain && (e = e._wrapped), n._chain && (n = n._wrapped), e.isEqual && tn.call(e.isEqual) == Wt) return e.isEqual(n);
            if (n.isEqual && tn.call(n.isEqual) == Wt) return n.isEqual(e);
            var i = tn.call(e);
            if (i != tn.call(n)) return !1;
            switch (i) {
                case Xt:
                    return e == String(n);
                case Vt:
                    return e != +e ? n != +n : 0 == e ? 1 / e == 1 / n : e == +n;
                case Bt:
                case Ut:
                    return +e == +n;
                case Jt:
                    return e.source == n.source && e.global == n.global && e.multiline == n.multiline && e.ignoreCase == n.ignoreCase
            }
            if ("object" != typeof e || "object" != typeof n) return !1;
            for (var o = r.length; o--;)
                if (r[o] == e) return !0;
            var a = -1,
                s = !0,
                c = 0;
            if (r.push(e), i == Ht) {
                if (c = e.length, s = c == n.length)
                    for (; c-- && (s = tt(e[c], n[c], r)););
            } else {
                if ("constructor" in e != "constructor" in n || e.constructor != n.constructor) return !1;
                for (var l in e)
                    if (Yt.call(e, l) && (c++, !(s = Yt.call(n, l) && tt(e[l], n[l], r)))) break;
                if (s) {
                    for (l in n)
                        if (Yt.call(n, l) && !c--) break;
                    s = !c
                }
                if (s && St)
                    for (; ++a < 7 && (l = Mt[a], !Yt.call(e, l) || (s = Yt.call(n, l) && tt(e[l], n[l], r))););
            }
            return r.pop(), s
        }

        function nt(e) {
            return on(e) && tn.call(e) == Vt
        }

        function rt(e) {
            return tn.call(e) == Wt
        }

        function it(e) {
            return Rt[typeof e] && null !== e
        }

        function ot(e) {
            return tn.call(e) == Vt && e != +e
        }

        function at(e) {
            return null === e
        }

        function st(e) {
            return tn.call(e) == Vt
        }

        function ct(e) {
            return tn.call(e) == Jt
        }

        function lt(e) {
            return tn.call(e) == Xt
        }

        function ut(e) {
            return e === t
        }

        function dt(e) {
            for (var t, n = 0, r = Qt.apply(Gt, arguments), i = r.length, o = {}; ++n < i;) t = r[n], t in e && (o[t] = e[t]);
            return o
        }

        function ft(e) {
            var t = tn.call(e);
            return t == Ht || t == Xt ? e.length : On(e).length
        }

        function pt(e, t) {
            return t(e), e
        }

        function ht(e) {
            return null == e ? "" : (e + "").replace(_t, s)
        }

        function gt(e) {
            return e
        }

        function mt(e) {
            wn(jn(e), function(t) {
                var i = n[t] = e[t];
                r.prototype[t] = function() {
                    var e = [this._wrapped];
                    arguments.length && Zt.apply(e, arguments);
                    var t = i.apply(n, e);
                    return this._chain && (t = new r(t), t._chain = !0), t
                }
            })
        }

        function vt() {
            return e._ = Et, this
        }

        function yt(e, t) {
            if (!e) return null;
            var n = e[t];
            return tn.call(n) == Wt ? e[t]() : n
        }

        function bt(e, t, r) {
            r || (r = {});
            var i, s = n.templateSettings,
                c = r.escape,
                l = r.evaluate,
                p = r.interpolate,
                h = r.variable;
            return null == c && (c = s.escape), null == l && (l = s.evaluate), null == p && (p = s.interpolate), c && (e = e.replace(c, u)), p && (e = e.replace(p, d)), l && (e = e.replace(l, f)), e = "__p='" + e.replace(qt, a).replace(jt, o) + "';\n", Dt.length = 0, h || (h = s.variable, e = "with (" + h + " || {}) {\n" + e + "\n}\n"), e = "function(" + h + ") {\nvar __p, __t, __j = Array.prototype.join;\nfunction print() { __p += __j.call(arguments, '') }\n" + e + "return __p\n}", Lt && (e += "\n//@ sourceURL=/lodash/template/source[" + Ot+++"]"), i = Function("_", "return " + e)(n), t ? i(t) : (i.source = e, i)
        }

        function $t(e, t, n) {
            var r = -1;
            if (n)
                for (; ++r < e;) t.call(n, r);
            else
                for (; ++r < e;) t(r)
        }

        function wt(e) {
            var t = At++;
            return e ? e + t : t
        }

        function kt(e) {
            return e = new r(e), e._chain = !0, e
        }

        function xt() {
            return this._chain = !0, this
        }

        function Tt() {
            return this._wrapped
        }
        var Ct = "object" == typeof exports && exports && ("object" == typeof global && global && global == global.global && (e = global), exports),
            St = !{
                valueOf: 0
            }.propertyIsEnumerable("valueOf"),
            At = 0,
            Et = e._,
            Nt = RegExp("^" + ({}.valueOf + "").replace(/[.*+?^=!:${}()|[\]\/\\]/g, "\\$&").replace(/valueOf|for [^\]]+/g, ".+?") + "$"),
            jt = /__token__(\d+)/g,
            _t = /[&<"']/g,
            qt = /['\n\r\t\u2028\u2029\\]/g,
            Mt = ["constructor", "hasOwnProperty", "isPrototypeOf", "propertyIsEnumerable", "toLocaleString", "toString", "valueOf"],
            Ot = 0,
            It = "__token__",
            Dt = [];
        try {
            var Lt = (Function("//@")(), !0)
        } catch (Pt) {}
        var Ft = {
                "&": "&amp;",
                "<": "&lt;",
                '"': "&quot;",
                "'": "&#x27;"
            }, Rt = {
                "boolean": !1,
                "function": !0,
                object: !0,
                number: !1,
                string: !1,
                undefined: !1
            }, zt = {
                "\\": "\\",
                "'": "'",
                "\n": "n",
                "\r": "r",
                "	": "t",
                "\u2028": "u2028",
                "\u2029": "u2029"
            }, Ht = "[object Array]",
            Bt = "[object Boolean]",
            Ut = "[object Date]",
            Wt = "[object Function]",
            Vt = "[object Number]",
            Jt = "[object RegExp]",
            Xt = "[object String]",
            Gt = Array.prototype,
            Kt = Object.prototype,
            Qt = Gt.concat,
            Yt = Kt.hasOwnProperty,
            Zt = Gt.push,
            en = Gt.slice,
            tn = Kt.toString,
            nn = Nt.test(nn = en.bind) && /\n|Opera/.test(nn + tn.call(e.opera)) && nn,
            rn = Nt.test(rn = Array.isArray) && rn,
            on = e.isFinite,
            an = Nt.test(an = Object.keys) && an,
            sn = e.clearTimeout,
            cn = e.setTimeout;
        n.templateSettings = {
            escape: /<%-([\s\S]+?)%>/g,
            evaluate: /<%([\s\S]+?)%>/g,
            interpolate: /<%=([\s\S]+?)%>/g,
            variable: "obj"
        };
        var ln = bt("var index, result<% if (init) { %> = <%= init %><% } %>;\n<%= exit %>;\n<%= top %>;\n<% if (arrayBranch) { %>var length = <%= firstArg %>.length; index = -1;  <% if (objectBranch) { %>\nif (length === length >>> 0) {<% } %>\n  <%= arrayBranch.beforeLoop %>;\n  while (<%= arrayBranch.loopExp %>) {\n    <%= arrayBranch.inLoop %>;\n  }  <% if (objectBranch) { %>\n}\n<% }}if (objectBranch) {  if (arrayBranch) { %>else {\n<% }  if (!hasDontEnumBug) { %>  var skipProto = typeof <%= iteratedObject %> == 'function';\n<% } %>  <%= objectBranch.beforeLoop %>;\n  for (<%= objectBranch.loopExp %>) {  \n<%  if (hasDontEnumBug) {    if (useHas) { %>    if (<%= hasExp %>) {\n  <% } %>    <%= objectBranch.inLoop %>;<%    if (useHas) { %>\n    }<% }  }  else {  %>    if (!(skipProto && index == 'prototype')<% if (useHas) { %> && <%= hasExp %><% } %>) {\n      <%= objectBranch.inLoop %>;\n    }  <% } %>\n  }  <% if (hasDontEnumBug) { %>\n  var ctor = <%= iteratedObject %>.constructor;\n  <% for (var k = 0; k < 7; k++) { %>\n  index = '<%= shadowed[k] %>';\n  if (<%      if (shadowed[k] == 'constructor') {        %>!(ctor && ctor.prototype === <%= iteratedObject %>) && <%      } %><%= hasExp %>) {\n    <%= objectBranch.inLoop %>;\n  }<%     }   }   if (arrayBranch) { %>\n}<% }} %>\n<%= bottom %>;\nreturn result"),
            un = {
                args: "collection, callback, thisArg",
                init: "collection",
                top: "if (!callback) {\n  callback = identity\n}\nelse if (thisArg) {\n  callback = iteratorBind(callback, thisArg)\n}",
                inLoop: "callback(collection[index], index, collection)"
            }, dn = {
                init: "true",
                inLoop: "if (!callback(collection[index], index, collection)) return !result"
            }, fn = {
                args: "object",
                init: "object",
                top: "for (var source, sourceIndex = 1, length = arguments.length; sourceIndex < length; sourceIndex++) {\n  source = arguments[sourceIndex];\n" + (St ? "  if (source) {" : ""),
                loopExp: "index in source",
                useHas: !1,
                inLoop: "object[index] = source[index]",
                bottom: (St ? "  }\n" : "") + "}"
            }, pn = {
                init: "[]",
                inLoop: "callback(collection[index], index, collection) && result.push(collection[index])"
            }, hn = {
                top: "if (thisArg) callback = iteratorBind(callback, thisArg)"
            }, gn = {
                inLoop: {
                    object: un.inLoop
                }
            }, mn = i({
                args: "object",
                exit: "if (!objectTypes[typeof object] || object === null) throw TypeError()",
                init: "[]",
                inLoop: "result.push(index)"
            }),
            vn = i({
                args: "collection, target",
                init: "false",
                inLoop: "if (collection[index] === target) return true"
            }),
            yn = i(un, dn),
            bn = i(un, pn),
            $n = i(un, hn, {
                init: "",
                inLoop: "if (callback(collection[index], index, collection)) return collection[index]"
            }),
            wn = i(un, hn),
            kn = i(un, {
                init: "",
                exit: "if (!collection) return []",
                beforeLoop: {
                    array: "result = Array(length)",
                    object: "result = []"
                },
                inLoop: {
                    array: "result[index] = callback(collection[index], index, collection)",
                    object: "result.push(callback(collection[index], index, collection))"
                }
            }),
            xn = i({
                args: "collection, callback, accumulator, thisArg",
                init: "accumulator",
                top: "var noaccum = arguments.length < 3;\nif (thisArg) callback = iteratorBind(callback, thisArg)",
                beforeLoop: {
                    array: "if (noaccum) result = collection[++index]"
                },
                inLoop: {
                    array: "result = callback(result, collection[index], index, collection)",
                    object: "result = noaccum\n  ? (noaccum = false, collection[index])\n  : callback(result, collection[index], index, collection)"
                }
            }),
            Tn = i(un, pn, {
                inLoop: "!" + pn.inLoop
            }),
            Cn = i(un, dn, {
                init: "false",
                inLoop: dn.inLoop.replace("!", "")
            }),
            Sn = i(fn, {
                inLoop: "if (object[index] == undefined)" + fn.inLoop
            }),
            An = i(fn),
            En = i(un, hn, gn, {
                useHas: !1
            }),
            Nn = i(un, hn, gn),
            jn = i({
                args: "object",
                init: "[]",
                useHas: !1,
                inLoop: "if (toString.call(object[index]) == funcClass) result.push(index)",
                bottom: "result.sort()"
            }),
            _n = function(e) {
                return "[object Arguments]" == tn.call(e)
            };
        _n(arguments) || (_n = function(e) {
            return !(!e || !Yt.call(e, "callee"))
        });
        var qn = rn || function(e) {
                return tn.call(e) == Ht
            }, Mn = i({
                args: "value",
                init: "true",
                top: "var className = toString.call(value);\nif (className == arrayClass || className == stringClass) return !value.length",
                inLoop: {
                    object: "return false"
                }
            }),
            On = an ? function(e) {
                return "function" == typeof e ? mn(e) : an(e)
            } : mn,
            In = i({
                args: "object",
                init: "[]",
                inLoop: "result.push(object[index])"
            });
        n.VERSION = "0.3.1", n.after = P, n.bind = F, n.bindAll = R, n.chain = kt, n.clone = K, n.compact = g, n.compose = z, n.contains = vn, n.debounce = H, n.defaults = Sn, n.defer = U, n.delay = B, n.difference = m, n.escape = ht, n.every = yn, n.extend = An, n.filter = bn, n.find = $n, n.first = v, n.flatten = y, n.forEach = wn, n.forIn = En, n.forOwn = Nn, n.functions = jn, n.groupBy = b, n.has = Q, n.identity = gt, n.indexOf = $, n.initial = w, n.intersection = k, n.invoke = x, n.isArguments = _n, n.isArray = qn, n.isBoolean = Y, n.isDate = Z, n.isElement = et, n.isEmpty = Mn, n.isEqual = tt, n.isFinite = nt, n.isFunction = rt, n.isNaN = ot, n.isNull = at, n.isNumber = st, n.isObject = it, n.isRegExp = ct, n.isString = lt, n.isUndefined = ut, n.keys = On, n.last = T, n.lastIndexOf = C, n.map = kn, n.max = S, n.memoize = W, n.min = A, n.mixin = mt, n.noConflict = vt, n.once = V, n.partial = J, n.pick = dt, n.pluck = E, n.range = N, n.reduce = xn, n.reduceRight = p, n.reject = Tn, n.rest = j, n.result = yt, n.shuffle = _, n.size = ft, n.some = Cn, n.sortBy = q, n.sortedIndex = M, n.tap = pt, n.template = bt, n.throttle = X, n.times = $t, n.toArray = h, n.union = O, n.uniq = I, n.uniqueId = wt, n.values = In, n.without = D, n.wrap = G, n.zip = L, n.all = yn, n.any = Cn, n.collect = kn, n.detect = $n, n.each = wn, n.foldl = xn, n.foldr = p, n.head = v, n.include = vn, n.inject = xn, n.methods = jn, n.select = bn, n.tail = j, n.take = v, n.unique = I, n._iteratorTemplate = ln, n._shimKeys = mn, r.prototype = n.prototype, mt(n), r.prototype.chain = xt, r.prototype.value = Tt, wn(["pop", "push", "reverse", "shift", "sort", "splice", "unshift"], function(e) {
            var t = Gt[e];
            r.prototype[e] = function() {
                var e = this._wrapped;
                return t.apply(e, arguments), 0 === e.length && delete e[0], this._chain && (e = new r(e), e._chain = !0), e
            }
        }), wn(["concat", "join", "slice"], function(e) {
            var t = Gt[e];
            r.prototype[e] = function() {
                var e = this._wrapped,
                    n = t.apply(e, arguments);
                return this._chain && (n = new r(n), n._chain = !0), n
            }
        }), "function" == typeof define && "object" == typeof define.amd && define.amd ? (e._ = n, define(function() {
            return n
        })) : Ct ? "object" == typeof module && module && module.exports == Ct ? (module.exports = n)._ = n : Ct._ = n : e._ = n
    }(this),
    function(e) {
        var t = e.document;
        if (!location.hash && e.addEventListener) {
            window.scrollTo(0, 1);
            var n = 1,
                r = function() {
                    return e.pageYOffset || "CSS1Compat" === t.compatMode && t.documentElement.scrollTop || t.body.scrollTop || 0
                }, i = setInterval(function() {
                    t.body && (clearInterval(i), n = r(), e.scrollTo(0, 1 === n ? 0 : 1))
                }, 15);
            e.addEventListener("load", function() {
                setTimeout(function() {
                    r() < 20 && e.scrollTo(0, 1 === n ? 0 : 1)
                }, 0)
            })
        }
    }(this), ! function(e, t) {
    "function" == typeof define ? define(t) : "undefined" != typeof module ? module.exports = t() : this[e] = t()
}("morpheus", function() {
    function e(e, t, n) {
        if (Array.prototype.indexOf) return e.indexOf(t);
        for (n = 0; n < e.length; ++n)
            if (e[n] === t) return n
    }

    function t(e) {
        var n, r = L.length;
        for (k && (e = w()), n = r; n--;) L[n](e);
        L.length && D(t)
    }

    function n(e) {
        1 === L.push(e) && D(t)
    }

    function r(t) {
        var n, r = e(L, t);
        r >= 0 && (n = L.slice(r + 1), L.length = r, L = L.concat(n))
    }

    function i(e, t) {
        var n, r = {};
        return (n = e.match(E)) && (r.rotate = g(n[1], t ? t.rotate : null)), (n = e.match(N)) && (r.scale = g(n[1], t ? t.scale : null)), (n = e.match(j)) && (r.skewx = g(n[1], t ? t.skewx : null), r.skewy = g(n[3], t ? t.skewy : null)), (n = e.match(_)) && (r.translatex = g(n[1], t ? t.translatex : null), r.translatey = g(n[3], t ? t.translatey : null)), r
    }

    function o(e) {
        var t = "";
        return "rotate" in e && (t += "rotate(" + e.rotate + "deg) "), "scale" in e && (t += "scale(" + e.scale + ") "), "translatex" in e && (t += "translate(" + e.translatex + "px," + e.translatey + "px) "), "skewx" in e && (t += "skew(" + e.skewx + "deg," + e.skewy + "deg)"), t
    }

    function a(e, t, n) {
        return "#" + (1 << 24 | e << 16 | t << 8 | n).toString(16).slice(1)
    }

    function s(e) {
        var t = e.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
        return (t ? a(t[1], t[2], t[3]) : e).replace(/#(\w)(\w)(\w)$/, "#$1$1$2$2$3$3")
    }

    function c(e) {
        return e.replace(/-(.)/g, function(e, t) {
            return t.toUpperCase()
        })
    }

    function l(e) {
        return "function" == typeof e
    }

    function u(e) {
        return Math.sin(e * Math.PI / 2)
    }

    function d(e, t, i, o, a, s) {
        function c(e) {
            var n = e - h;
            return n > d || g ? (s = isFinite(s) ? s : 1, g ? v && t(s) : t(s), r(c), i && i.apply(f)) : void t(isFinite(s) ? p * o(n / d) + a : o(n / d))
        }
        o = l(o) ? o : m.easings[o] || u;
        var d = e || T,
            f = this,
            p = s - a,
            h = w(),
            g = 0,
            v = 0;
        return n(c), {
            stop: function(e) {
                g = 1, v = e, e || (i = null)
            }
        }
    }

    function f(e, t) {
        var n, r, i = e.length,
            o = [];
        for (n = 0; i > n; ++n) o[n] = [e[n][0], e[n][1]];
        for (r = 1; i > r; ++r)
            for (n = 0; i - r > n; ++n) o[n][0] = (1 - t) * o[n][0] + t * o[parseInt(n + 1, 10)][0], o[n][1] = (1 - t) * o[n][1] + t * o[parseInt(n + 1, 10)][1];
        return [o[0][0], o[0][1]]
    }

    function p(e, t, n) {
        var r, i, o, a, s = [];
        for (r = 0; 6 > r; r++) o = Math.min(15, parseInt(t.charAt(r), 16)), a = Math.min(15, parseInt(n.charAt(r), 16)), i = Math.floor((a - o) * e + o), i = i > 15 ? 15 : 0 > i ? 0 : i, s[r] = i.toString(16);
        return "#" + s.join("")
    }

    function h(e, t, n, r, i, o, a) {
        if ("transform" == i) {
            a = {};
            for (var s in n[o][i]) a[s] = s in r[o][i] ? Math.round(((r[o][i][s] - n[o][i][s]) * e + n[o][i][s]) * T) / T : n[o][i][s];
            return a
        }
        return "string" == typeof n[o][i] ? p(e, n[o][i], r[o][i]) : (a = Math.round(((r[o][i] - n[o][i]) * e + n[o][i]) * T) / T, i in q || (a += t[o][i] || "px"), a)
    }

    function g(e, t, n, r, i) {
        return (n = S.exec(e)) ? (i = parseFloat(n[2])) && t + ("+" == n[1] ? 1 : -1) * i : parseFloat(e)
    }

    function m(e, t) {
        var n, r, a, u = e ? u = isFinite(e.length) ? e : [e] : [],
            p = t.complete,
            m = t.duration,
            v = t.easing,
            y = t.bezier,
            b = [],
            $ = [],
            w = [],
            k = [];
        for (y && (r = t.left, a = t.top, delete t.right, delete t.bottom, delete t.left, delete t.top), n = u.length; n--;) {
            if (b[n] = {}, $[n] = {}, w[n] = {}, y) {
                var x = I(u[n], "left"),
                    T = I(u[n], "top"),
                    S = [g(l(r) ? r(u[n]) : r || 0, parseFloat(x)), g(l(a) ? a(u[n]) : a || 0, parseFloat(T))];
                k[n] = l(y) ? y(u[n], S) : y, k[n].push(S), k[n].unshift([parseInt(x, 10), parseInt(T, 10)])
            }
            for (var E in t) {
                switch (E) {
                    case "complete":
                    case "duration":
                    case "easing":
                    case "bezier":
                        continue
                }
                var N, j = I(u[n], E),
                    _ = l(t[E]) ? t[E](u[n]) : t[E];
                "string" != typeof _ || !C.test(_) || C.test(j) ? (b[n][E] = "transform" == E ? i(j) : "string" == typeof _ && C.test(_) ? s(j).slice(1) : parseFloat(j), $[n][E] = "transform" == E ? i(_, b[n][E]) : "string" == typeof _ && "#" == _.charAt(0) ? s(_).slice(1) : g(_, parseFloat(j)), "string" == typeof _ && (N = _.match(A)) && (w[n][E] = N[1])) : delete t[E]
            }
        }
        return d.apply(u, [m,
            function(e, r, i) {
                for (n = u.length; n--;) {
                    y && (i = f(k[n], e), u[n].style.left = i[0] + "px", u[n].style.top = i[1] + "px");
                    for (var a in t) r = h(e, w, b, $, a, n), "transform" == a ? u[n].style[M] = o(r) : "opacity" != a || O ? u[n].style[c(a)] = r : u[n].style.filter = "alpha(opacity=" + 100 * r + ")"
                }
            },
            p, v
        ])
    }
    var v = document,
        y = window,
        b = y.performance,
        $ = b && (b.now || b.webkitNow || b.msNow || b.mozNow),
        w = $ ? function() {
            return $.call(b)
        } : function() {
            return +new Date
        }, k = !1,
        x = v.documentElement,
        T = 1e3,
        C = /^rgb\(|#/,
        S = /^([+\-])=([\d\.]+)/,
        A = /^(?:[\+\-]=?)?\d+(?:\.\d+)?(%|in|cm|mm|em|ex|pt|pc|px)$/,
        E = /rotate\(((?:[+\-]=)?([\-\d\.]+))deg\)/,
        N = /scale\(((?:[+\-]=)?([\d\.]+))\)/,
        j = /skew\(((?:[+\-]=)?([\-\d\.]+))deg, ?((?:[+\-]=)?([\-\d\.]+))deg\)/,
        _ = /translate\(((?:[+\-]=)?([\-\d\.]+))px, ?((?:[+\-]=)?([\-\d\.]+))px\)/,
        q = {
            lineHeight: 1,
            zoom: 1,
            zIndex: 1,
            opacity: 1,
            transform: 1
        }, M = function() {
            var e, t = v.createElement("a").style,
                n = ["webkitTransform", "MozTransform", "OTransform", "msTransform", "Transform"];
            for (e = 0; e < n.length; e++)
                if (n[e] in t) return n[e]
        }(),
        O = function() {
            return "undefined" != typeof v.createElement("a").style.opacity
        }(),
        I = v.defaultView && v.defaultView.getComputedStyle ? function(e, t) {
            t = "transform" == t ? M : t, t = c(t);
            var n = null,
                r = v.defaultView.getComputedStyle(e, "");
            return r && (n = r[t]), e.style[t] || n
        } : x.currentStyle ? function(e, t) {
            if (t = c(t), "opacity" == t) {
                var n = 100;
                try {
                    n = e.filters["DXImageTransform.Microsoft.Alpha"].opacity
                } catch (r) {
                    try {
                        n = e.filters("alpha").opacity
                    } catch (i) {}
                }
                return n / 100
            }
            var o = e.currentStyle ? e.currentStyle[t] : null;
            return e.style[t] || o
        } : function(e, t) {
            return e.style[c(t)]
        }, D = function() {
            return y.requestAnimationFrame || y.webkitRequestAnimationFrame || y.mozRequestAnimationFrame || y.msRequestAnimationFrame || y.oRequestAnimationFrame || function(e) {
                y.setTimeout(function() {
                    e(+new Date)
                }, 17)
            }
        }();
    D(function(e) {
        k = e > 1e12 != w() > 1e12
    });
    var L = [];
    return m.tween = d, m.getStyle = I, m.bezier = f, m.transform = M, m.parseTransform = i, m.formatTransform = o, m.easings = {}, m
});
var easings = {
    easeOut: function(e) {
        return Math.sin(e * Math.PI / 2)
    },
    easeOutStrong: function(e) {
        return 1 == e ? 1 : 1 - Math.pow(2, -10 * e)
    },
    easeIn: function(e) {
        return e * e
    },
    easeInStrong: function(e) {
        return 0 == e ? 0 : Math.pow(2, 10 * (e - 1))
    },
    easeOutBounce: function(e) {
        return 1 / 2.75 > e ? 7.5625 * e * e : 2 / 2.75 > e ? 7.5625 * (e -= 1.5 / 2.75) * e + .75 : 2.5 / 2.75 > e ? 7.5625 * (e -= 2.25 / 2.75) * e + .9375 : 7.5625 * (e -= 2.625 / 2.75) * e + .984375
    },
    easeInBack: function(e) {
        var t = 1.70158;
        return e * e * ((t + 1) * e - t)
    },
    easeOutBack: function(e) {
        var t = 1.70158;
        return (e -= 1) * e * ((t + 1) * e + t) + 1
    },
    bounce: function(e) {
        return 1 / 2.75 > e ? 7.5625 * e * e : 2 / 2.75 > e ? 7.5625 * (e -= 1.5 / 2.75) * e + .75 : 2.5 / 2.75 > e ? 7.5625 * (e -= 2.25 / 2.75) * e + .9375 : 7.5625 * (e -= 2.625 / 2.75) * e + .984375
    },
    bouncePast: function(e) {
        return 1 / 2.75 > e ? 7.5625 * e * e : 2 / 2.75 > e ? 2 - (7.5625 * (e -= 1.5 / 2.75) * e + .75) : 2.5 / 2.75 > e ? 2 - (7.5625 * (e -= 2.25 / 2.75) * e + .9375) : 2 - (7.5625 * (e -= 2.625 / 2.75) * e + .984375)
    },
    swingTo: function(e) {
        var t = 1.70158;
        return (e -= 1) * e * ((t + 1) * e + t) + 1
    },
    swingFrom: function(e) {
        var t = 1.70158;
        return e * e * ((t + 1) * e - t)
    },
    elastic: function(e) {
        return -1 * Math.pow(4, -8 * e) * Math.sin(2 * (6 * e - 1) * Math.PI / 2) + 1
    },
    spring: function(e) {
        return 1 - Math.cos(4.5 * e * Math.PI) * Math.exp(6 * -e)
    },
    blink: function(e, t) {
        return Math.round(e * (t || 5)) % 2
    },
    pulse: function(e, t) {
        return -Math.cos(e * ((t || 5) - .5) * 2 * Math.PI) / 2 + .5
    },
    wobble: function(e) {
        return -Math.cos(e * Math.PI * 9 * e) / 2 + .5
    },
    sinusoidal: function(e) {
        return -Math.cos(e * Math.PI) / 2 + .5
    },
    flicker: function(e) {
        var e = e + (Math.random() - .5) / 5;
        return easings.sinusoidal(0 > e ? 0 : e > 1 ? 1 : e)
    },
    mirror: function(e) {
        return easings.sinusoidal(.5 > e ? 2 * e : 1 - 2 * (e - .5))
    }
};
angular.module("app", ["app.filters", "app.directives", "app.directives.spinner", "app.directives.effects", "app.directives.notifications", "app.directives.loader", "app.directives.mobile", "app.directives.placeholder", "app.directives.sanitize", "app.directives.moderation", "app.services.moderation", "app.services.sanitize", "app.services.lq.controller", "app.services.countdown", "app.services.auth", "app.services.session", "app.services.lang", "app.services.quiz", "app.services.ios7fixes", "app.services.preloader", "app.services.config", "app.services.random", "app.services.browser", "app.directives.debug", "app.directives.blocking", "underscore", "ngRoute", "ngSanitize"]).config(["$routeProvider", "$locationProvider",
    function(e) {
        kahoot.theme.current.controller.templateBase;
        e.when("/", {
            templateUrl: "gameid.html",
            controller: GameCtrl,
            resolve: {
                loadContent: appCtrl.loadContent
            }
        }), e.when("/join", {
            templateUrl: "join.html",
            controller: JoinCtrl,
            resolve: {
                loadContent: appCtrl.loadContent
            }
        }), e.when("/instructions", {
            templateUrl: "instructions.html",
            controller: InstructionsCtrl,
            resolve: {
                loadContent: appCtrl.loadContent
            }
        }), e.when("/start", {
            templateUrl: "start.html",
            controller: StartCtrl,
            resolve: {
                loadContent: appCtrl.loadContent
            }
        }), e.when("/getready", {
            templateUrl: "getready.html",
            controller: GetReadyCtrl,
            resolve: {
                loadContent: appCtrl.loadContent
            }
        }), e.when("/answer", {
            templateUrl: "answer.html",
            controller: AnswerCtrl,
            resolve: {
                loadContent: appCtrl.loadContent
            }
        }), e.when("/ranking", {
            templateUrl: "ranking.html",
            controller: RankingCtrl,
            resolve: {
                loadContent: appCtrl.loadContent
            }
        }), e.when("/feedback", {
            templateUrl: "feedback.html",
            controller: FeedbackCtrl,
            resolve: {
                loadContent: appCtrl.loadContent
            }
        }), e.when("/gameover", {
            templateUrl: "gameover.html",
            controller: GameOverCtrl,
            resolve: {
                loadContent: appCtrl.loadContent
            }
        }), e.otherwise({
            redirectTo: "/"
        })
    }
]).run(["$config",
    function() {}
]), appCtrl.loadContent = function(e, t, n, r) {
    return window.device && navigator.splashscreen.hide(), n.defer = e.defer(), n.siteAppContent ? n.defer.resolve() : (r.getContent(), n.$on("loadContentSuccess", function() {
        n.defer.resolve()
    }), n.$on("loadContentFailure", function() {
        n.defer.reject()
    })), n.defer.promise
}, appCtrl.loadContent.$inject = ["$q", "$timeout", "$rootScope", "$lang", "$ios7fixes"], angular.module("app.services.auth", []).factory("$authentication", [
    function() {
        var e = {
            oAuthHeaders: function() {
                return {}
            }
        };
        return e
    }
]), angular.module("app.services.moderation", []).factory("$moderation", ["$rootScope", "$cookies",
    function(e, t) {
        var n = {
            kickCookieName: "bLjokq2kR2b82fN",
            kickCookie: function(e) {
                t[n.kickCookieName] = e.toString()
            },
            kickAlert: function(t) {
                e.$broadcast("snitch", {
                    kickCode: t
                }), e.$broadcast("alert", {
                    key: "kicked-general",
                    message: e.siteAppContent.errors["kicked-general"],
                    alertType: "error",
                    autoDismiss: !1,
                    userDismissable: !1
                })
            },
            kickController: function(r) {
                r = r || t[n.kickCookieName], n.kickAlert(r), n.kickCookie(r), e.user && (e.user.name = "")
            },
            isKicked: function() {
                return 1 * t[n.kickCookieName] > 0
            },
            unKick: function() {
                delete t[n.kickCookieName], e.$broadcast("snitch.clear")
            }
        };
        return n
    }
]), angular.module("app.services.lq.controller", ["app.services.mobitroll", "app.services.utils", "app.services.profanityfilter", "app.services.network", "app.services.lq.analytics"]).factory("$lecturequiz-controller", ["$mobitroll", "$location", "$rootScope", "$config", "$log", "_", "$profanityfilter", "$utils", "$preloader", "$window", "$network", "$timeout", "$analytics", "$moderation", "$quiz",
    function(e, t, n, r, i, o, a, s, c, l, u, d, f, p, h) {
        function g() {
            e.withComet(function(e) {
                e.publish("/service/controller", {
                    type: "login",
                    gameid: n.gameId,
                    host: r.comet.server,
                    name: $
                })
            })
        }
        var m, v, y, b = r.comet.events,
            $ = "",
            w = !1,
            k = !1,
            x = !1;
        n.$on(u.events.lagUpdate, function(t, r) {
            if (e.isConnected()) switch (n.$broadcast("dismissAlert", {
                key: "reconnecting"
            }), r.assessment) {
                case u.latencyThreshold.unplayable:
                    x && (n.$broadcast("dismissAlert", {
                        key: "network-usable"
                    }), n.$broadcast("wait", {
                        message: n.siteAppContent.info["slow-network"]
                    }), n.$broadcast("alert", {
                        key: "network-unusable",
                        alertType: "error",
                        message: n.siteAppContent.errors["network-unusable"],
                        autoDismiss: !0,
                        userDismissable: !0
                    }));
                    break;
                case u.latencyThreshold.playableWithDifficulty:
                    x && (n.$broadcast("clearWait"), n.$broadcast("dismissAlert", {
                        key: "network-unusable"
                    }), n.$broadcast("alert", {
                        key: "network-usable",
                        alertType: "warning",
                        message: n.siteAppContent.info["network-usable"],
                        autoDismiss: !0,
                        userDismissable: !0
                    }));
                    break;
                case u.latencyThreshold.playable:
            }
        }), n.$on("userNameCleaned", function(e, t) {
            $ = t
        }), n.$on("handshakeSuccess", function() {
            C.trackConnection("handshakeSuccess"), T()
        }), n.$on("connectionEstablished", function() {
            T(), C.trackConnection("connectionEstablished"), null !== C.playerId && e.withComet(function(e) {
                e.publish("/service/controller", {
                    type: "relogin",
                    gameid: n.gameId,
                    host: r.comet.server,
                    cid: C.playerId
                })
            }), n.$broadcast("dismissAlert", {
                key: "reconnecting"
            }), C.state == C.states.playing ? (n.$broadcast("wait", {
                message: n.siteAppContent.info["waiting-next-question"]
            }), n.$broadcast("alert", {
                key: "waitingfornextquestion",
                alertType: "success",
                message: n.siteAppContent.info["welcome-back"]
            })) : x && n.$broadcast("clearWait")
        }), n.$on("connectionBroken", function() {
            n.$broadcast("wait", {
                message: n.siteAppContent.info["attempt-reconnection"]
            }), n.$broadcast("alert", {
                key: "reconnecting",
                message: n.siteAppContent.misc.oops + ". " + n.siteAppContent.errors["lost-connection"]
            }), C.trackConnection("connectionBroken")
        }), n.$on("$routeChangeSuccess", function() {
            switch (t.path()) {
                case "/":
                case "/join":
                    C.state = C.states.joining, u.unwatchNetworkMessages();
                    break;
                case "/instructions":
                case "/start":
                    C.state = C.states.waitingToStart;
                    break;
                case "/getready":
                case "/answer":
                    C.state = C.states.playing;
                    break;
                case "/gameover":
                    C.state = C.states.gameOver
            }
        });
        var T = function() {
            m && e.unsubscribe(m), v && e.unsubscribe(v), y && e.unsubscribe(y), m = null, v = null, y = null, m = e.subscribe("/service/controller"), v = e.subscribe("/service/player"), y = e.subscribe("/service/status")
        };
        n.$on("messageRecieved", function(t, r) {
            function i(e) {
                n.qIdx = e.questionIndex, n.quizType = e.quizType, n.quizQuestionAnswers = e.quizQuestionAnswers, n.qAnswerMap = e.answerMap || {
                    1: 1,
                    2: 2,
                    3: 3,
                    4: 4
                }
            }
            if ("loginResponse" === r.data.type)
                if (r.data.error) switch (String(r.data.error)) {
                    case "USER_INPUT":
                        n.$broadcast("clearWait"), n.$broadcast("badUsername"), n.$broadcast("alert", {
                            key: "duplicatenickname",
                            message: n.siteAppContent.errors["quiz-nickname-taken"],
                            alertType: "error",
                            autoDismiss: !1,
                            userDismissable: !0
                        });
                        break;
                    case "RESTART":
                        g(), C.trackConnection("restart");
                        break;
                    case "NONEXISTING_SESSION":
                        x = !1, n.$broadcast("wait", {
                            message: n.siteAppContent.info["attempt-reconnection"]
                        }), n.$broadcast("alert", {
                            key: "nonexisting-session",
                            message: n.siteAppContent.misc.oops + ". " + n.siteAppContent.errors["lost-session"]
                        }), d(function() {
                            g()
                        }, 3e3), C.trackConnection("nonExistingSession")
                } else n.$broadcast("clearWait"), n.$broadcast("dismissAlert", {
                    key: "nonexisting-session"
                }), n.$broadcast("dismissAlert", {
                    key: "duplicatenickname"
                }), C.playerId = r.data.cid, k || e.redirect("/instructions"), k = !1, x = !0;
            else if ("status" === r.data.type) switch (String(r.data.status)) {
                case "MISSING":
                    C.state != C.states.gameOver && n.$broadcast("wait", {
                        message: n.siteAppContent.info["please-wait"],
                        level: 5
                    }), w = !0, C.trackConnection("playerMissing");
                    break;
                case "ACTIVE":
                    w && (w = !1, k = !0, n.$broadcast("clearWait", {
                        level: 5
                    }), C.trackConnection("playerActive"))
            } else if ("message" === r.data.type) switch (parseInt(r.data.id, 10)) {
                case b.getReady:
                    i(angular.fromJson(r.data.content)), e.redirect("/getready"), p.unKick();
                    break;
                case b.startQuestion:
                    C.state != C.states.playing && (i(angular.fromJson(r.data.content)), e.redirect("/answer"), n.$broadcast("dismissAllNotifications"));
                    break;
                case b.timeUp:
                    n.$broadcast("timeUp", {
                        content: angular.fromJson(r.data.content)
                    });
                    break;
                case b.gameOver:
                    n.result = angular.fromJson(r.data.content), n.quizType = n.result.quizType, n.quizQuestionAnswers = n.result.quizQuestionAnswers, "quiz" !== n.quizType && e.redirect("/gameover"), n.$broadcast("dismissAllNotifications");
                    break;
                case b.feedback:
                    e.redirect("/feedback"), n.$broadcast("dismissAllNotifications");
                    break;
                case b.playAgain:
                    e.redirect("/instructions"), n.$broadcast("dismissAllNotifications");
                    break;
                case b.answerResponse:
                    n.$broadcast("answerResponse", angular.fromJson(r.data.content));
                    break;
                case b.revealAnswer:
                    n.$broadcast("revealAnswer", angular.fromJson(r.data.content));
                    break;
                case b.revealRanking:
                    var o = angular.fromJson(r.data.content);
                    n.primaryRankingMessage = o.primaryMessage, n.secondaryRankingMessage = o.secondaryMessage, e.redirect("/ranking");
                    break;
                case b.startQuiz:
                    var a = angular.fromJson(r.data.content);
                    n.quizName = a.quizName, n.quizType = a.quizType || "quiz", n.quizQuestionAnswers = a.quizQuestionAnswers, n.quizRandAnswers = a.quizRandAnswers, n.qIdx = 0, e.redirect("/start");
                    break;
                case b.resetController:
                    var s = angular.fromJson(r.data.content);
                    e.disconnect(), e.redirect("/"), s.kickCode && p.kickController(s.kickCode)
            }
        });
        var C = {
            playerId: null,
            playerRank: null,
            states: {
                joining: 0,
                waitingToStart: 1,
                playing: 2,
                gameOver: 3
            },
            state: null,
            connect: e.connect,
            disconnect: e.disconnect,
            reset: function() {
                this.disconnect(), n.gameId = null, this.playerId = null, this.playerRank = null
            },
            join: function(t) {
                var i = t,
                    o = t.replace(/[0-9\s\!\Â£\$\%\^\&\*\(\)\_\-\+\;\:\'\"\\\|\]\}\[\{\,\<\.\>\/\?\`\~\Â§\Â±]/gi, "");
                a.clean(o, function(t) {
                    var a = o === t ? i : t;
                    n.$broadcast("userNameCleaned", a), u.watchNetworkMessages(), e.withComet(function(e) {
                        e.publish("/service/controller", {
                            type: "login",
                            gameid: n.gameId,
                            host: r.comet.server,
                            name: a
                        })
                    })
                })
            },
            selectAnswer: function(t) {
                e.withComet(function(e) {
                    e.publish("/service/controller", {
                        id: b.answerSelected,
                        type: "message",
                        gameid: n.gameId,
                        host: r.comet.server,
                        content: angular.toJson({
                            choice: n.qAnswerMap[t],
                            meta: {
                                lag: u.getLag(),
                                device: {
                                    userAgent: l.navigator.userAgent,
                                    screen: {
                                        width: l.screen.availWidth,
                                        height: l.screen.availHeight
                                    }
                                }
                            }
                        })
                    })
                })
            },
            submitFeedback: function(t) {
                e.withComet(function(e) {
                    e.publish("/service/controller", {
                        id: b.submitFeedback,
                        type: "message",
                        gameid: n.gameId,
                        host: r.comet.server,
                        content: angular.toJson(t)
                    })
                })
            },
            preloadAssets: function() {
                var e = "/theme/" + kahoot.theme.current.name + "/img",
                    t = "/shared/theme/kahoot/img";
                if (Modernizr.svg) var n = ["/buttons/square.svg", "/buttons/triangle.svg", "/buttons/cross.svg", "/buttons/circle.svg", "/error.svg", "/information.svg", "/success.svg", "/warning.svg", "/kahoot.svg", "/sad.svg", "/happy.svg", "/indifferent.svg", "/dont_recommend_blue.svg", "/dont_recommend_white_selected.svg", "/number_blue.svg", "/number_white_selected.svg", "/star_yellow.svg", "/star_white_selected.svg", "/recommend_blue.svg", "/recommend_white_selected.svg"];
                else var n = ["/buttons/square.png", "/buttons/triangle.png", "/buttons/cross.png", "/buttons/circle.png"];
                var r = ["/alert_sprites.png"],
                    i = ["/alert_sprites_retina.png"],
                    o = 2 == l.devicePixelRatio ? i : r;
                c.fetchImages(o, e), c.fetchImages(n, t)
            },
            ensureConnection: e.ensureConnection,
            ordinal: s.ordinal,
            connectionInfo: function() {
                var t = {
                    game_pin: n.gameId,
                    client_id: e.clientId()
                };
                return C.playerId > 0 && (t.cid = C.playerId), t
            },
            trackConnection: function(e) {
                var t = "controller";
                f.trackConnection(t, e, C.connectionInfo())
            },
            getPlayerRank: function() {
                return h.quizTypes[n.quizType].showRank ? this.playerRank : void 0
            },
            setPlayerRank: function(e) {
                return this.playerRank = e, this.getPlayerRank()
            }
        };
        return C
    }
]), GameCtrl.$inject = ["$rootScope", "$scope", "$location", "$log", "$lecturequiz-controller", "$window", "$config", "$session"], JoinCtrl.$inject = ["$rootScope", "$location", "$log", "$lecturequiz-controller", "$preloader", "$window", "$config"], InstructionsCtrl.$inject = ["$scope", "$rootScope", "$log", "$lecturequiz-controller"], StartCtrl.$inject = ["$rootScope", "$scope", "$lecturequiz-controller", "$quiz", "$location"], GetReadyCtrl.$inject = ["$scope", "$rootScope", "$countdown", "$location", "$lecturequiz-controller", "$quiz"], AnswerCtrl.$inject = ["$scope", "$rootScope", "$timeout", "$log", "$lecturequiz-controller", "_", "$quiz", "$location", "sanitize"], RankingCtrl.$inject = ["$scope", "$rootScope", "$location", "$lecturequiz-controller", "$quiz"], FeedbackCtrl.$inject = ["$scope", "$rootScope", "$log", "$lecturequiz-controller", "$location", "$quiz", "$timeout"], GameOverCtrl.$inject = ["$rootScope", "$scope", "$lecturequiz-controller", "$window", "$config", "$quiz", "$location", "$timeout"], angular.module("app.filters", []).filter("interpolate", ["version",
    function(e) {
        return function(t) {
            return String(t).replace(/\%VERSION\%/gm, e)
        }
    }
]), angular.module("app.directives", []).directive("appVersion", ["version",
    function(e) {
        return function(t, n) {
            n.text(e)
        }
    }
]), angular.module("app.directives.spinner", []).directive("spinner", function() {
    var e = {
        link: function(e, t) {
            var n = new Spinner(kahoot.theme.current.controller.spinner).spin();
            t.append(n.el)
        }
    };
    return e
}), angular.module("app.directives.moderation", ["app.services.moderation"]).directive("snitch", ["$moderation",
    function(e) {
        return function(t, n) {
            t.$on("snitch", function() {
                n.addClass("kicked")
            }), t.$on("snitch.clear", function() {
                n.removeClass("kicked")
            }), t.$on("loadContentSuccess", function() {
                e.isKicked() && (n.addClass("kicked"), e.kickAlert())
            })
        }
    }
]), angular.module("app.directives.mobile", []).directive("tap", ["$rootScope",
    function() {
        return function(e, t, n) {
            function r() {
                e.$apply(n.tap)
            }
            t.bind("mouseup", r)
        }
    }
]).directive("tapstart", ["$rootScope",
    function() {
        return function(e, t, n) {
            function r() {
                e.$apply(n.tapstart)
            }
            t.bind("mousedown", r), t.bind("touchstart", function() {
                t.unbind("mousedown", r), r()
            })
        }
    }
]).directive("ios7fix", ["$timeout", "$rootScope",
    function(e) {
        return function(t, n) {
            n.bind("touchend", function() {
                e(function() {
                    n.trigger("focus")
                }, 500)
            })
        }
    }
]).directive("ios7ViewportFix", ["$rootScope", "$window",
    function(e, t) {
        return function() {
            if (t.navigator.userAgent.match(/(iPad|iPhone);.*CPU.*OS 7_\d/i) && t.innerHeight != t.document.documentElement.clientHeight) {
                var e = function() {
                    t.document.body.style.height = t.innerHeight + "px", 0 !== t.document.body.scrollTop && t.scrollTo(0, 0)
                };
                t.addEventListener("orientationchange", e, !1), e(), t.document.body.style.webkitTransform = "translate3d(0,0,0)"
            }
        }
    }
]).directive("ios7lazyfix", ["$rootScope", "$window",
    function(e, t) {
        return function() {
            t.navigator.userAgent.match(/ OS 7_\d/i) && t.scrollTo(0, 0)
        }
    }
]), angular.module("app.directives.effects", []).directive("fadeoutOnClick", function() {
    return {
        link: function(e, t, n) {
            var r = parseInt(n.fadeDuration);
            isNaN(r) && (r = 500), t.bind("click", function() {
                var e = $(this);
                e.animate({
                    opacity: 0
                }, r, "linear", function() {
                    t.remove()
                })
            })
        }
    }
}).directive("slideUp", function() {
    return {
        link: function(e, t, n) {
            var r = parseInt(n.slideDuration);
            isNaN(r) && (r = 250);
            var i = $(t[0]);
            i.css("bottom", -(i.height() + 10)), i.animate({
                bottom: 0
            }, r, "linear")
        }
    }
}).directive("shake", function() {
    return {
        link: function(e, t, n) {
            if ("" !== n.shake) {
                var r = n.shake;
                e.$on(r, function() {
                    t[0].style[morpheus.transform] = "translate(0px,0px)";
                    var e = 3,
                        n = -10;
                    ! function r(e, n) {
                        morpheus(t[0], {
                            transform: "translate(" + e + "px,0px)",
                            duration: 100,
                            easing: easings.easeOut,
                            complete: function() {
                                n > 0 ? r(-e, n - 1) : 0 == n && r(0, n - 1)
                            }
                        })
                    }(n, e)
                })
            }
        }
    }
}), angular.module("app").run(["$templateCache",
    function(e) {
        e.put("answer.html", '<div class="screen answer-screen" ios7lazyfix>  <div class="statusbar top">    <div class="info">      <div ng-class="scoreClass()" ng-cloak>{{totalScore}}</div>      <div class="playerrank" ng-bind-html="playerRank"></div>      <div class="username" ng-cloak>{{user.cleanName}}</div>    </div>    <div class="title">      <div class="number" ng-cloak>{{questionNumber(\'Q\')}}</div>      <div class="question" ng-cloak>{{statusBarTitle}}</div>    </div>  </div>  <div class="center valignwrapper selectanswer" ng-class="animatedBackgroundClass()">    <div class="valign">      <div class="answerButtons" ng-class="answerButtonsClass()">        <button class="answer answerA" type="button" tapstart="selectAnswer(0)"><span>A</span></button>        <button class="answer answerB" type="button" tapstart="selectAnswer(1)"><span>B</span></button>        <button class="answer answerC" type="button" tapstart="selectAnswer(2)" ng-show="showAnswer(2)"><span>C</span></button>        <button class="answer answerD" type="button" tapstart="selectAnswer(3)" ng-show="showAnswer(3)"><span>D</span></button>      </div>      <div class="answerFeedback pad" ng-class="answerFeedbackClass()">        <div class="spinner" spinner></div>        <h1 ng-bind-html="primaryFeedbackMessage"></h1>      </div>      <div class="message" ng-class="messageClass()">        <div class="valign">          <div class="result" ng-class="resultClass()">            <div class="resultIcon" ng-class="resultIcon()"></div>            <h1 ng-cloak ng-bind-html="resultMessage"></h1>          </div>          <button class="btn disabled selectedAnswer" ng-class="selectedAnswerClass()"><span bind-html="selectedAnswerLabel()"></span></button>          <h4 class="message_container" ng-bind-html="statusMessage" ng-class="statusMessageClass()"></h4>        </div>      </div>    </div>  </div>  <div class="statusbar fixed bottom">    <div class="username" ng-cloak>{{user.cleanName}}</div>    <div ng-class="scoreClass()" ng-cloak>{{totalScore}}</div>    <div class="playerrank" ng-bind-html="playerRank"></div>  </div></div>'), e.put("feedback.html", '<div class="screen feedback-screen" ios7lazyfix>  <div class="statusbar top">    <div class="info">      <div ng-class="scoreClass()" ng-cloak>{{totalScore}}</div>      <div class="playerrank" ng-bind-html="playerRank"></div>      <div class="username" ng-cloak>{{user.cleanName}}</div>    </div>    <div class="title">      <div class="question" ng-cloak>{{statusBarTitle}}</div>    </div>  </div>  <div class="sub-screen" ng-show="!done()">    <div class="center main valignwrapper feedback">      <div class="valign pad">        <div class="feedback-item">          <div class="feedback-question">How fun was it?</div>          <div class="feedback-controls">            <div class="scale-control">              <div class="scale-input"><input type="radio" name="feedback2" id="feedback2-1" value="1" ng-model="feedback.fun"><label for="feedback2-1" class="s1"></label></div>            </div>            <div class="scale-control">              <div class="scale-input"><input type="radio" name="feedback2" id="feedback2-2" value="2" ng-model="feedback.fun"><label for="feedback2-2" class="s2"></label></div>            </div>            <div class="scale-control">              <div class="scale-input"><input type="radio" name="feedback2" id="feedback2-3" value="3" ng-model="feedback.fun"><label for="feedback2-3" class="s3"></label></div>            </div>            <div class="scale-control">              <div class="scale-input"><input type="radio" name="feedback2" id="feedback2-4" value="4" ng-model="feedback.fun"><label for="feedback2-4" class="s4"></label></div>            </div>            <div class="scale-control">              <div class="scale-input"><input type="radio" name="feedback2" id="feedback2-5" value="5" ng-model="feedback.fun"><label for="feedback2-5" class="s5"></label></div>            </div>          </div>        </div>        <div class="feedback-item binary">          <div class="feedback-question">Did you learn something?</div>          <div class="feedback-controls">            <div class="scale-control binary">              <div class="scale-input"><input type="radio" name="feedback1" id="feedback1-1" value="1" ng-model="feedback.learning"><label for="feedback1-1" class="like"></label></div>            </div>            <div class="scale-control binary">              <div class="scale-input"><input type="radio" name="feedback1" id="feedback1-2" value="0" ng-model="feedback.learning"><label for="feedback1-2" class="dislike"></label></div>            </div>          </div>        </div>        <div class="feedback-item binary">          <div class="feedback-question">Do you recommend it?</div>          <div class="feedback-controls">            <div class="scale-control binary">              <div class="scale-input"><input type="radio" name="feedback3" id="feedback3-1" value="1" ng-model="feedback.recommend"><label for="feedback3-1" class="like"></label></div>            </div>            <div class="scale-control binary">              <div class="scale-input"><input type="radio" name="feedback3" id="feedback3-2" value="0" ng-model="feedback.recommend"><label for="feedback3-2" class="dislike"></label></div>            </div>          </div>        </div>      </div>    </div>    <div class="info-footer">      <div class="content">        <div class="feedback-summary">          <div class="feedback-item">            <div class="feedback-question">To continue, tell us how you feel?</div>            <div>              <button type="button" class="face-btn happy" tap="smile()"></button>              <button type="button" class="face-btn indifferent" tap="meh()"></button>              <button type="button" class="face-btn sad" tap="frown()"></button>            </div>          </div>        </div>      </div>    </div>  </div>  <div class="sub-screen" ng-show="done()">    <div class="center main valignwrapper feedback">      <div class="valign pad">        <h1 ng-bind="feedbackResponse().title">Thanks!</h1>        <div class="smiley" ng-class="feeling()"></div>        <div class="feedback-response" ng-bind="feedbackResponse().text"></div>      </div>    </div>  </div></div>'), e.put("gameid.html", '<div class="center join_view valignwrapper" ios7lazyfix>	<div class="valign">		<div class="logo center-block"><span>Kahoot!</span></div>		<form ng-submit="joinSession(gameId)">			<input id="inputSession" ios7fix class="username" placeholder="Game pin" ng-model="gameId" type="tel" maxlength="6" shake="badGameId">			<button type="button" class="btn btn-block btn-greyscale join" blocking tap="joinSession(gameId)">Enter</button>		</form>	</div>	<p class="info" ng-show="notStandalone()">Make your own at <a href="https://getkahoot.com" target="_system">getkahoot.com</a></a></p></div>'), e.put("gameover.html", '<div class="screen gameover-screen" ios7lazyfix>  <div class="statusbar top endscreen">    <div class="info">      <div ng-class="scoreClass()" ng-cloak>{{totalScore}}</div>      <div class="username" ng-cloak>{{user.cleanName}}</div>    </div>    <div class="title">      <div class="question" ng-cloak>{{statusBarTitle}}</div>    </div>  </div>  <div class="center valignwrapper gameover" ng-class="gameOverClass()">    <div class="valign">      <h1 ng-bind-html="gameoverTitle()"></h1>      <h4 ng-cloak ng-bind-html="resultMessage()"></h4>      <div class="resultsList" ng-class="resultsListClass()">        <div class="correct">          <div class="icon"></div>          <div class="answers" ng-cloak>{{result.correctCount}} correct</div>        </div>        <div class="incorrect">          <div class="icon"></div>          <div class="answers" ng-cloak>{{result.incorrectCount}} incorrect</div>        </div>      </div>      <div ng-class="shareSocialClass()">        <span class="text">Share my {{shareWhat}}:</span>        <a ng-click="shareTwitter()" class="but-twitter" type="button">Tweet on twitter</a>        <a ng-click="shareFacebook()" class="but-facebook" type="button">Post to my wall</a>      </div>    </div>  </div>  <div class="info-footer">    <div class="divider"></div>    <div class="content">      <p><a href="https://getkahoot.com/register/" target="_system"><strong>Get my free account now</strong> and start making my own! <i class="icon-link"></i></a></p>    </div>  </div>  <div class="statusbar fixed bottom">    <div class="username" ng-cloak>{{user.cleanName}}</div>    <div ng-class="scoreClass()" ng-cloak>{{totalScore}}</div>  </div></div>'), e.put("getready.html", '<div class="statusbar top" ios7lazyfix>  <div class="info">    <div ng-class="scoreClass()" ng-cloak>{{totalScore}}</div>    <div class="playerrank" ng-bind-html="playerRank"></div>    <div class="username" ng-cloak>{{user.cleanName}}</div>  </div>  <div class="title">    <div class="number" ng-cloak>{{questionNumber(\'Q\')}}</div>    <div class="question" ng-cloak>{{statusBarTitle}}</div>  </div></div><div class="center intro valignwrapper">  <div class="valign">    <h1 ng-cloak>{{questionNumber(\'Question \')}}</h1>    <h1 class="counter" ng-cloak>{{counter}}</h1>    <h4 ng-bind-html="introMessage()"></h4>  </div></div><div class="statusbar fixed bottom">  <div class="username" ng-cloak>{{user.cleanName}}</div>  <div ng-class="scoreClass()" ng-cloak>{{totalScore}}</div>  <div class="playerrank" ng-bind-html="playerRank"></div></div>'), e.put("instructions.html", '<div class="screen instructions-screen" ios7lazyfix>  <div class="statusbar top">    <div class="info">      <div ng-class="scoreClass()" ng-cloak>{{totalScore}}</div>      <div class="username" ng-cloak>{{user.cleanName}}</div>    </div>    <div class="title">      <div class="question" ng-cloak>{{statusBarTitle}}</div>    </div>  </div>  <div class="center main valignwrapper instructions">    <div class="valign pad">      <h1>You&rsquo;re In!</h1>      <h4>Did you see your name appear at the front?</h4>    </div>  </div>  <div class="statusbar fixed bottom">    <div class="username" ng-cloak>{{user.cleanName}}</div>    <div ng-class="scoreClass()" ng-cloak>{{totalScore}}</div>  </div></div>'), e.put("join.html", '<div class="screen join-screen" ios7lazyfix>	<div class="statusbar">		<div class="title" ng-cloak>{{statusBarTitle}}</div>	</div>	<div class="center join_view valignwrapper">				<div class="valign">			<h1>Play Now</h1>			<form ng-submit="join(user)">				<input id="username" ios7fix class="username" type="text" placeholder="Nickname" ng-model="user.name" maxlength="15" shake="badUsername">				<button type="button" class="btn btn-block btn-greyscale join" blocking tap="join(user)">Join game</button>			</form>		 </div>	</div></div>'), e.put("ranking.html", '<div class="screen ranking-screen" ios7lazyfix>  <div class="statusbar top">    <div class="info">      <div ng-class="scoreClass()" ng-cloak>{{totalScore}}</div>      <div class="playerrank" ng-bind-html="playerRank"></div>      <div class="username" ng-cloak>{{user.cleanName}}</div>    </div>    <div class="title">      <div class="question" ng-cloak>{{statusBarTitle}}</div>    </div>  </div>  <div class="center valignwrapper animated-background">    <div class="valign pad">      <h1 ng-bind-html="primaryMessage"></h1>      <h4 ng-bind-html="secondaryMessage"></h4>    </div>  </div>  <div class="statusbar fixed bottom">    <div class="username" ng-cloak>{{user.cleanName}}</div>    <div ng-class="scoreClass()" ng-cloak>{{totalScore}}</div>    <div class="playerrank" ng-bind-html="playerRank"></div>  </div></div>'), e.put("start.html", '<div class="screen start-screen" ios7lazyfix>  <div class="statusbar top">    <div class="info">      <div ng-cloak ng-class="scoreClass()">{{totalScore}}</div>      <div class="username" ng-cloak>{{user.cleanName}}</div>    </div>    <div class="title">      <div class="question">{{statusBarTitle}}</div>    </div>  </div>  <div class="center main valignwrapper start">    <div class="valign pad">      <h1>Get Ready!</h1>      <div class="spinner" spinner></div>      <h4>Loading</h4>    </div>  </div>  <div class="statusbar fixed bottom">    <div class="username" ng-cloak>{{user.cleanName}}</div>    <div ng-class="scoreClass()" ng-cloak>{{totalScore}}</div>  </div></div>')
    }
]);
