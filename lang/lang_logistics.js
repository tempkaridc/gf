var languagePack_logistics =
    {
        "ko": {
            "HTML": {
                "TITLE": "소녀전선 - 군수지원 효율계산 / 추천 시뮬레이터",
                "TABLE": {
                    "RSRC": "자원",
                    "AREA": "지역",
                    "HUMA": "인력",
                    "AMMO": "탄약",
                    "FOOD": "식량",
                    "PART": "부품",
                    "SUM": "합계",
                    "SUMRATIO": "자원 합계비> ",
                    "TIME": "시간",
                    "BTNSUCS": "완료시<br>획득",
                    "BTNTIME": "시간당<br>획득",
                    "SELAREA": "선택<br>지역",
                    "LOAD": " 불러오기",
                    "SAVE": " 저장",
                    "CAPT": " 캡쳐",
                    "COPY": " URL 복사",
                    "TIMETABLE": " 시간표",
                    "TICKET": "계약서",
                    "TICKET_DOLL": "인형제조계약서",
                    "TICKET_TOOL": "장비제조계약서",
                    "TICKET_FAST": "쾌속제조계약서",
                    "TICKET_REPR": "쾌속수복계약서",
                    "TICKET_TOKN": "구매 토큰",
                    "TICKET_PER_HOUR": "시간당 획득률",
                    "TICKET_PER_RECV": "완료시 획득률",
                    "PER_HOUR": "시간당",
                    "PER_RECV": "완료시",
                    "TICKET_RATIO": "획득확률",
                    "HELP": {
                        "RESET": "초기화",
                        "NOTICE": "공지사항",
                        "OPEN": "도움말 열기",
                        "CLOSE": "도움말 닫기",
                        "TIPS": {
                            "TIP1": "1. 자원량 / 계약서 획득량은 표 좌측 하단의 <span id=\"help_time\"><a href=\"#\">시간당 / 완료시 획득 전환 버튼</a></span> 으로 변경 가능",
                            "TIP2": "2. 표 상단의 <a href=\"#\">자원명</a> <font color=\"red\">클릭 시</font>, 해당 자원 우선 정렬",
                            "TIP3": "3. 표의 <a href=\"#\">합계</a> 값은 <font color=\"red\">자원 합계비</font>에 따라 계산. 기본값 1:1:1:2.2",
                            "TIP4": "4. 계약서 획득확률 참고자료(<font style=\"color:blue;\"><a href=\"https://github.com/tempkaridc/gf/blob/master/js/params.js\" target=\"_blank\">링크</a></font>)",
                            "TIP5": "5. 하단 예상 그래프는 <a href=\"#\">현재자원</a> <font color=\"red\">값부터 합산</font>, 미입력시 0부터 계산",
                            "TIP5a": "<div style=\"margin-left:10px;\">a. <a href=\"#\">자동회복</a> 활성화 시 3분당 인탄식부 3:3:3:1 회복</div>",
                            "TIP6": "6. <a href=\"#\">대성공률</a> 적용 시, 자원 및 계약서 획득률을 대성공 기대치로 재계산",
                            "TIP7": "7. <a href=\"#\">확인주기</a> 적용 시, 모든 군수의 시간을 주기의 배수로 변경",
                            "TIP8": "8. <div class=\"btn btn-danger\"></div><div class=\"btn btn-primary\"></div> 기능/선택 버튼, <div class=\"btn btn-default\"></div><div class=\"btn btn-success\"></div> 켜기/끄기 버튼",
                            "TIP9": "9. <a href=\"#\">자동추천</a> 은 입력된 <font color=\"red\">가중치 비율의 자원 획득</font>을 위한 군수 조합 추천",
                            "TIP9a": "<div style=\"margin-left:10px;\">a. <a href=\"#\">지역선택</a>, <a href=\"#\">시간대설정</a>, <a href=\"#\">대성공률</a>, <a href=\"#\">계약서 획득률</a>, <a href=\"#\">확인 주기</a>를 모두 반영</div>",
                            "TIP9b": "<div style=\"margin-left:10px;\">b. <span id=\"help_wght\"><a href=\"#\">내 가중치</a></span> 버튼 클릭 시, 개인 가중치 계산 가능</div>",
                            "TIP9c": "<div style=\"margin-left:10px;\">c. 결과의 백분율 표시는 입력된 가중치와 결과값 사이의 가중치 일치율을 의미</div>",
                            "TIP9d": "<div style=\"margin-left:10px;\">d. 계산 시 자원량이 적은 초반지역 [1~4지역] 제외 추천</div>"
                        },
                        "AREASELECT": {
                            "TITLE": "지역선택"
                        },
                        "TIMESELECT": {
                            "TITLE": "시간대",
                            "SELTIMEHOUR": "시간"
                        },
                        "SUMRATE": {
                            "TITLE": "자원 합계비",
                            "BTN": "적용"
                        },
                        "PRESOURCE": {
                            "TITLE": "현재자원",
                            "REFILL": "자동회복"
                        },
                        "SUCCESS": {
                            "TITLE": "대성공",
                            "SUMLEVEL": "제대 레벨합계",
                            "SUCSRATIO": "대성공 확률",
                            "BTN": "적용",
                            "EVENT": "군수지원 대성공 확률 UP 이벤트",
                            "EVENTBTN": "확률UP"
                        },
                        "INTERVAL": {
                            "TITLE": "확인주기",
                            "BTN": "적용"
                        },
                        "RECOMMEND": {
                            "TITLE": "자동추천",
                            "RATIO": {
                                "BTN_RATIO": "내 가중치",
                                "CHOICE": {
                                    "DAY": {
                                        "TITLE": "일일사용량 기반 계산",
                                        "TEXT": "하루에 사용하는 자원량에 의거한 개인 가중치 계산",
                                        "TABLE1": "일일사용량 기반 계산 예",
                                        "TABLE2": "인형제조 범용1식 4회",
                                        "TABLE3": "장비제조 범용1식 4회",
                                        "TABLE4": "전역 9회 클리어",
                                        "TABLE5": "합계 <small>(아래 입력)</small>",
                                        "TABLE6": "가중치",
                                        "TABLEs1": "사용량"
                                    },
                                    "USES": {
                                        "TITLE": "최종목표치 기반 계산",
                                        "TEXT": "목표로 삼은 자원량에서 역산한 개인 가중치 계산",
                                        "TABLE1": "최종목표량 기반 계산 예",
                                        "TABLE2": "현재 자원량 <small>(아래 입력)</small>",
                                        "TABLE3": "목표 자원량 <small>(아래 입력)</small>",
                                        "TABLE4": "오차",
                                        "TABLE5": "가중치",
                                        "TABLEs1": "현재",
                                        "TABLEs2": "목표"
                                    }
                                },
                                "BTN_CALC": "계산",
                                "CALC_TEXT": "'계산'클릭 시, 가중치 자동입력"
                            },
                            "SUCSRATIO": "계약서",
                            "TEXT_PERHOUR1": "시간당 ",
                            "TEXT_PERHOUR2": "개 이상",
                            "BTN_RCMD": "지역 추천",
                            "RESULT": "추천조합",
                            "SIMM": "가중치 일치율",
                            "FEEDBACK": "재보정"
                        }
                    }
                },
                "CHART": {
                    "AREA": "지역:",
                    "TIME": "기간:",
                    "BTN1": "1일",
                    "BTN2": "1주",
                    "BTN3": "2주",
                    "BTN4": "4주",
                    "DAY": "일",
                    "HOUR": "시",
                    "MIN": "분"
                },
                "MODAL": {
                    "LOAD": {
                        "TITLE": "저장된 조합 불러오기",
                        "AREA": "지역",
                        "HELP": "설명"
                    }
                },
                "BOTTOM": {
                    "ADDR": "주소: ",
                    "SGST": "건의사항: ",
                    "OPTI": "이 페이지는 Chrome, FF, Edge에 최적화되어 있습니다."
                },
                "INCODE": {
                    "ALERT1": "최종목표치는 현재보다 크거나 같아야 합니다",
                    "ALERT2": "검색 결과가 없습니다",
                    "ALERT3": "하나 이상의 군수지역을 선택해야 합니다",
                    "ALERT4": "주소가 클립보드에 복사되었습니다",
                    "ALERT5": "모든 설정을 초기화하고 페이지를 새로 고칩니다",
                    "SAVE": "저장할 조합의 이름을 입력하세요",
                    "DELETE": "지우기"
                }
            },
            "CHART": {
                lang: {
                    months: [
                        '1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'
                    ],
                    shortMonths: [
                        '1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'
                    ],
                    weekdays: [
                        '일요일','월요일','화요일','수요일','목요일','금요일','토요일'
                    ],
                    shortWeekdays: [
                        '일','월','화','수','목','금','토'
                    ]
                }
            }
        },
        "en": {
            "HTML": {
                "TITLE": "Girls' Frontline Logistic Support Calculator",
                "TABLE": {
                    "RSRC": "Resource",
                    "AREA": "Area",
                    "HUMA": "Manpw.",
                    "AMMO": "Ammo",
                    "FOOD": "Rations",
                    "PART": "Parts",
                    "SUM": "Total",
                    "SUMRATIO": "Total Sumrate> ",
                    "TIME": "Time",
                    "BTNSUCS": "Per<br>Area",
                    "BTNTIME": "Per<br>Hour",
                    "SELAREA": "Selected<br>Area",
                    "LOAD": " Load",
                    "SAVE": " Save",
                    "CAPT": " Capture",
                    "COPY": " Copy URL",
                    "TIMETABLE": " Agenda",
                    "TICKET": "Contracts",
                    "TICKET_DOLL": "T-Doll Contract",
                    "TICKET_TOOL": "Equipment Production Contract",
                    "TICKET_FAST": "Quick Production Contract",
                    "TICKET_REPR": "Quick Restoration Contract",
                    "TICKET_TOKN": "Token",
                    "TICKET_PER_HOUR": "Chance per hour",
                    "TICKET_PER_RECV": "Chance per area",
                    "PER_HOUR": "perHour",
                    "PER_RECV": "perArea",
                    "TICKET_RATIO": "Chance",
                    "HELP": {
                        "RESET": "Reset",
                        "NOTICE": "Changelog",
                        "OPEN": "Open Help",
                        "CLOSE": "Close Help",
                        "TIPS": {
                            "TIP1": "1. Toggle 'Resource & Contract gain per HOUR or AREA' with <span id=\"help_time\"><a href=\"#toggleTime\">Button left-bottom of the table</a></span>",
                            "TIP2": "2. Click <a href=\"#\">Resource Name</a>, to sort with it",
                            "TIP3": "3. <a href=\"#\">Total</a> calculated with <font color=\"red\">Total Sumrate</font> multiplier. Default 1:1:1:2.2",
                            "TIP4": "4. Contract Gain Chance Reference(<font style=\"color:blue;\"><a href=\"https://github.com/tempkaridc/gf/blob/master/js/params.js\" target=\"_blank\">Link</a></font>)",
                            "TIP5": "5. Graph starts from <a href=\"#\">Pre Resources</a><font color=\"red\"></font>, default is 0",
                            "TIP5a": "<div style=\"margin-left:10px;\">a. <a href=\"#\">Auto Resupply</a> add 3 : 3 : 3 : 1 resource per 3 min</div>",
                            "TIP6": "6. When you apply <a href=\"#\">Great Success</a>, recaluculate resource & contracts gain to expectation value",
                            "TIP7": "7. When you apply <a href=\"#\">Check Cycle</a>, recalculate every time to multiple of cycle time",
                            "TIP8": "8. <div class=\"btn btn-danger\"></div><div class=\"btn btn-primary\"></div> Function / Select Button, <div class=\"btn btn-default\"></div><div class=\"btn btn-success\"></div> On / Off Toggle Button",
                            "TIP9": "9. <a href=\"#\">Recommend</a> provides area combination with <font color=\"red\">Resource Weight</font>",
                            "TIP9a": "<div style=\"margin-left:10px;\">a. Reflect <a href=\"#\">Chapters</a>, <a href=\"#\">Time Periods</a>, <a href=\"#\">Great Success</a>, <a href=\"#\">Contract Chance</a>, <a href=\"#\">Check Cycle</a></div>",
                            "TIP9b": "<div style=\"margin-left:10px;\">b. Calculate personal resource weights with <span id=\"help_wght\"><a href=\"#\">Calc weights</a></span> </div>",
                            "TIP9c": "<div style=\"margin-left:10px;\">c. Result % means similarity between input ratio & result</div>",
                            "TIP9d": "<div style=\"margin-left:10px;\">d. It is recommended to exclude early stages [Area 1~4]</div>"
                        },
                        "AREASELECT": {
                            "TITLE": "Chapters"
                        },
                        "TIMESELECT": {
                            "TITLE": "Time Periods",
                            "SELTIMEHOUR": "hour"
                        },
                        "SUMRATE": {
                            "TITLE": "Total Sumrate",
                            "BTN": "Apply"
                        },
                        "PRESOURCE": {
                            "TITLE": "Pre Resources",
                            "REFILL": "Auto Resupply"
                        },
                        "SUCCESS": {
                            "TITLE": "Great Success",
                            "SUMLEVEL": "Levelsum",
                            "SUCSRATIO": "GS Chance",
                            "BTN": "Apply",
                            "EVENT": "Great Success rate-up event",
                            "EVENTBTN": "Rate-UP"
                        },
                        "INTERVAL": {
                            "TITLE": "Check Cycle",
                            "BTN": "Apply"
                        },
                        "RECOMMEND": {
                            "TITLE": "Recommend",
                            "RATIO": {
                                "BTN_RATIO": "Calc weights",
                                "CHOICE": {
                                    "DAY": {
                                        "TITLE": "Daily Weight",
                                        "TEXT": "Calculate with daily uses",
                                        "TABLE1": "Example",
                                        "TABLE2": "T-DOLL Standard Set x 4",
                                        "TABLE3": "Equipment Standard Set x 4",
                                        "TABLE4": "Clear 9 Areas",
                                        "TABLE5": "Sum <small>(input below)</small>",
                                        "TABLE6": "Weight",
                                        "TABLEs1": "Usage"
                                    },
                                    "USES": {
                                        "TITLE": "Target Weight",
                                        "TEXT": "Calculate with target amount",
                                        "TABLE1": "Example",
                                        "TABLE2": "Present Resource <small>(input below)</small>",
                                        "TABLE3": "Goal Resource <small>(input below)</small>",
                                        "TABLE4": "Difference",
                                        "TABLE5": "Weight",
                                        "TABLEs1": "Now",
                                        "TABLEs2": "Goal"
                                    }
                                },
                                "BTN_CALC": "Calculate",
                                "CALC_TEXT": "Click 'Calculate' to get your own weight"
                            },
                            "SUCSRATIO": "Contracts",
                            "TEXT_PERHOUR1": "Over ",
                            "TEXT_PERHOUR2": "/h",
                            "BTN_RCMD": "Recommend Combination",
                            "RESULT": "Results",
                            "SIMM": "Weight Similarity",
                            "FEEDBACK": "Adjust"
                        }
                    }
                },
                "CHART": {
                    "AREA": "Area:",
                    "TIME": "Period:",
                    "BTN1": "1D",
                    "BTN2": "1W",
                    "BTN3": "2W",
                    "BTN4": "4W",
                    "DAY": "",
                    "HOUR": "",
                    "MIN": ""
                },
                "MODAL": {
                    "LOAD": {
                        "TITLE": "Load saved areas",
                        "AREA": "Areas",
                        "HELP": "Description"
                    }
                },
                "BOTTOM": {
                    "ADDR": "Address: ",
                    "SGST": "Suggestions: ",
                    "OPTI": "This website is optimized for Chrome, FF, Edge"
                },
                "INCODE": {
                    "ALERT1": "Goal must bigger than present",
                    "ALERT2": "No result",
                    "ALERT3": "You muse select at least one area",
                    "ALERT4": "URL copied to clipboard",
                    "ALERT5": "Return settings to default and refresh current page",
                    "SAVE": "Name your save",
                    "DELETE": "Delete"
                }
            },
            "CHART": {
                lang: {
                    months: [
                        'January','February','March','April','May','June','July','August','September','October','November','December'
                    ],
                    shortMonths: [
                        'Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'
                    ],
                    weekdays: [
                        'Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'
                    ],
                    shortWeekdays: [
                        'Sun','Mon','Tue','Wed','Thu','Fri','Sat'
                    ]
                }
            }
        },
        "ja": {
            "HTML": {
                "TITLE": "ドールフロ - 後方支援 効率計算 / 推選 シミュレータ",
                "TABLE": {
                    "RSRC": "資源",
                    "AREA": "戦役",
                    "HUMA": "人力",
                    "AMMO": "弾薬",
                    "FOOD": "配給",
                    "PART": "パーツ",
                    "SUM": "合算",
                    "SUMRATIO": "合算レート> ",
                    "TIME": "時間",
                    "BTNSUCS": "完了時<br>獲得",
                    "BTNTIME": "一時間<br>獲得",
                    "SELAREA": "選択<br>戦役",
                    "LOAD": " ロード",
                    "SAVE": " セーブ",
                    "CAPT": " スクショ",
                    "COPY": " URL 複写",
                    "TIMETABLE": " タイムテーブル",
                    "TICKET": "契約",
                    "TICKET_DOLL": "人形製造契約",
                    "TICKET_TOOL": "装備製造契約",
                    "TICKET_FAST": "快速製造契約",
                    "TICKET_REPR": "快速修復契約",
                    "TICKET_TOKN": "購買トークン",
                    "TICKET_PER_HOUR": "一時間獲得率",
                    "TICKET_PER_RECV": "完了時獲得率",
                    "PER_HOUR": "一時間",
                    "PER_RECV": "完了時",
                    "TICKET_RATIO": "獲得率",
                    "HELP": {
                        "RESET": "デフォルト",
                        "NOTICE": "アップデート",
                        "OPEN": "ヘルプを開く",
                        "CLOSE": "ヘルプを閉じる",
                        "TIPS": {
                            "TIP1": "1. 資源量 / 契約獲得量は表左側下段の <span id=\"help_time\"><a href=\"#toggleTime\">一時間 / 完了時獲得転換ボタン</a></span> で転換可能",
                            "TIP2": "2. 表上段の <a href=\"#\">資源</a> <font color=\"red\">クリック時</font>, 整列",
                            "TIP3": "3. 表の <a href=\"#\">合計</a> は資源比 <font color=\"red\">合算レート</font>で計算. デフォルトち 1:1:1:2.2",
                            "TIP4": "4. 表の契約獲得率(<font style=\"color:blue;\"><a href=\"https://github.com/tempkaridc/gf/blob/master/js/params.js\" target=\"_blank\">リンク</a></font>)",
                            "TIP5": "5. 下段予想グラフは <a href=\"#\">現在資源</a> <font color=\"red\">量から合算</font>, 入力なしと０から計算",
                            "TIP5a": "<div style=\"margin-left:10px;\">a. <a href=\"#\">自動回復</a> 活性化時3分当たり人弾配パ3:3:3:1回復</div>",
                            "TIP6": "6. <a href=\"#\">大成功率</a> 適用時資源及び契約獲得率は大成功期待値で再計算",
                            "TIP7": "7. <a href=\"#\">確認サイクル</a> 適用時全後方支援の時間を確認サイクルの倍数で再計算",
                            "TIP8": "8. <div class=\"btn btn-danger\"></div><div class=\"btn btn-primary\"></div> 機能/選択ボタン, <div class=\"btn btn-default\"></div><div class=\"btn btn-success\"></div> オン・オフボタン",
                            "TIP9": "9. <a href=\"#\">自動推選</a> は入力された <font color=\"red\">重み付け比率の資源獲得</font>ための配置推選",
                            "TIP9a": "<div style=\"margin-left:10px;\">a. <a href=\"#\">戦役選択</a>, <a href=\"#\">時間帯設定</a>, <a href=\"#\">大成功率</a>, <a href=\"#\">契約獲得率</a>, <a href=\"#\">確認サイクル</a> 全て反映</div>",
                            "TIP9b": "<div style=\"margin-left:10px;\">b. <span id=\"help_wght\"><a href=\"#\">私の重み付け</a></span> ボタンクリック時、個人重み付け計算可能</div>",
                            "TIP9c": "<div style=\"margin-left:10px;\">c. 推選配置の百分率表しは入力された重み付けと結果値あいだの重み付け一致率を意味します。</div>",
                            "TIP9d": "<div style=\"margin-left:10px;\">d. 初期段階[戦役1~4]を除外することをお勧めします。</div>"
                        },
                        "AREASELECT": {
                            "TITLE": "戦役選択"
                        },
                        "TIMESELECT": {
                            "TITLE": "時間帯設定",
                            "SELTIMEHOUR": "時間"
                        },
                        "SUMRATE": {
                            "TITLE": "合算レート",
                            "BTN": "適用"
                        },
                        "PRESOURCE": {
                            "TITLE": "現在資源",
                            "REFILL": "自動回復"
                        },
                        "SUCCESS": {
                            "TITLE": "大成功率",
                            "SUMLEVEL": "梯隊レベル合計",
                            "SUCSRATIO": "大成功率",
                            "BTN": "適用",
                            "EVENT": "後方支援大成功確率UP",
                            "EVENTBTN": "確率UP"
                        },
                        "INTERVAL": {
                            "TITLE": "確認サイクル",
                            "BTN": "適用"
                        },
                        "RECOMMEND": {
                            "TITLE": "自動推選",
                            "RATIO": {
                                "BTN_RATIO": "私の重み付け",
                                "CHOICE": {
                                    "DAY": {
                                        "TITLE": "一日使用量で計算",
                                        "TEXT": "一日に使用する資源量を基盤とする個人重み付け計算",
                                        "TABLE1": "一日使用量で計算例",
                                        "TABLE2": "人形製造汎用式4回",
                                        "TABLE3": "装備製造汎用式4回",
                                        "TABLE4": "戦役9回クリア",
                                        "TABLE5": "合計 <small>(下に入力)</small>",
                                        "TABLE6": "重み付け",
                                        "TABLEs1": "使用量"
                                    },
                                    "USES": {
                                        "TITLE": "最終目標値で計算",
                                        "TEXT": "目標とした資源量から逆算した個人重み付け計算",
                                        "TABLE1": "最終目標値で計算例",
                                        "TABLE2": "現在資源量 <small>(下に入力)</small>",
                                        "TABLE3": "目標資源量 <small>(下に入力)</small>",
                                        "TABLE4": "誤差",
                                        "TABLE5": "重み付け",
                                        "TABLEs1": "現在",
                                        "TABLEs2": "目標"
                                    }
                                },
                                "BTN_CALC": "計算",
                                "CALC_TEXT": "'計算'クリック時、重み付け自動入力"
                            },
                            "SUCSRATIO": "獲得率",
                            "TEXT_PERHOUR1": "時間当たり",
                            "TEXT_PERHOUR2": "個以上",
                            "BTN_RCMD": "戦役推選",
                            "RESULT": "推選結果",
                            "SIMM": "重み付け一致率",
                            "FEEDBACK": "漕艇"
                        }
                    }
                },
                "CHART": {
                    "AREA": "戦役:",
                    "TIME": "期間:",
                    "BTN1": "1日",
                    "BTN2": "1週",
                    "BTN3": "2週",
                    "BTN4": "4週",
                    "DAY": "日",
                    "HOUR": "時",
                    "MIN": "分"
                },
                "MODAL": {
                    "LOAD": {
                        "TITLE": "セーブされた配置ロード",
                        "AREA": "戦役",
                        "HELP": "ヘルプ"
                    }
                },
                "BOTTOM": {
                    "ADDR": "アドレス: ",
                    "SGST": "建議事項: ",
                    "OPTI": "このページは Chrome、FF、Edgeに最適化されています。"
                },
                "INCODE": {
                    "ALERT1": "最終目標値は現在より大きいか同じでなければなりません。",
                    "ALERT2": "検索結果が有りません。",
                    "ALERT3": "一つ以上の支援を選択してください。",
                    "ALERT4": "クリップボードにURLを複写しました。",
                    "ALERT5": "すべての設定を初期状態に戻します。",
                    "SAVE": "セーブする配置の名前を入力してください。",
                    "DELETE": "デリート"
                }
            },
            "CHART": {
                lang: {
                    months: [
                        '1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'
                    ],
                    shortMonths: [
                        '1月','2月','3月','4月','5月','6月','7月','8月','9月','10月','11月','12月'
                    ],
                    weekdays: [
                        '日','月','火','水','木','金','土'
                    ],
                    shortWeekdays: [
                        '日','月','火','水','木','金','土'
                    ]
                }
            }
        }
    };