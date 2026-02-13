(globalThis.TURBOPACK || (globalThis.TURBOPACK = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/Desktop/SentinelOS/client/components/quicklog.module.css [app-client] (css module)", ((__turbopack_context__) => {

__turbopack_context__.v({
  "actions": "quicklog-module__WtJ82q__actions",
  "bigButton": "quicklog-module__WtJ82q__bigButton",
  "container": "quicklog-module__WtJ82q__container",
  "form": "quicklog-module__WtJ82q__form",
  "info": "quicklog-module__WtJ82q__info",
  "label": "quicklog-module__WtJ82q__label",
  "rangeLabels": "quicklog-module__WtJ82q__rangeLabels",
  "row": "quicklog-module__WtJ82q__row",
  "save": "quicklog-module__WtJ82q__save",
  "tag": "quicklog-module__WtJ82q__tag",
  "tagActive": "quicklog-module__WtJ82q__tagActive",
  "tagsRow": "quicklog-module__WtJ82q__tagsRow",
  "toast": "quicklog-module__WtJ82q__toast",
});
}),
"[project]/Desktop/SentinelOS/client/components/QuickLog.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>QuickLog
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/SentinelOS/client/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/SentinelOS/client/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__ = __turbopack_context__.i("[project]/Desktop/SentinelOS/client/components/quicklog.module.css [app-client] (css module)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
;
const SEMANTIC_LABEL = (v)=>{
    if (v <= 3) return 'drained';
    if (v <= 6) return 'stable';
    if (v <= 8) return 'energized';
    return 'peak';
};
_c = SEMANTIC_LABEL;
function QuickLog() {
    _s();
    const [behavior, setBehavior] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [value, setValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(7);
    const [expectedValue, setExpectedValue] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(undefined);
    const [note, setNote] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('');
    const [tags, setTags] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [message, setMessage] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [lastLogAt, setLastLogAt] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [recent, setRecent] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])({
        "QuickLog.useState": ()=>{
            try {
                const raw = localStorage.getItem('recentLogs');
                return raw ? JSON.parse(raw) : [];
            } catch  {
                return [];
            }
        }
    }["QuickLog.useState"]);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "QuickLog.useEffect": ()=>{
            if (!message) return;
            const t = setTimeout({
                "QuickLog.useEffect.t": ()=>setMessage(null)
            }["QuickLog.useEffect.t"], 2500);
            return ({
                "QuickLog.useEffect": ()=>clearTimeout(t)
            })["QuickLog.useEffect"];
        }
    }["QuickLog.useEffect"], [
        message
    ]);
    function toggleTag(name) {
        setTags((s)=>s.includes(name) ? s.filter((t)=>t !== name) : [
                ...s,
                name
            ]);
    }
    async function submitLog(auto = false) {
        if (!behavior) return;
        const now = Date.now();
        if (lastLogAt && now - lastLogAt < 10 * 60 * 1000) {
            // soft guard: if too frequent, ask confirmation
            const ok = confirm('You logged recently — are you sure you want to log again?');
            if (!ok) return;
        }
        const payload = {
            behaviorType: behavior,
            value,
            expectedValue,
            timestamp: new Date().toISOString(),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            tags,
            note: note || undefined
        };
        // optimistic feedback
        setMessage('✅ Logged. You\'re building your behavioral intelligence.');
        setLastLogAt(Date.now());
        const optimisticEntry = {
            behaviorType: behavior,
            value,
            timestamp: new Date().toISOString(),
            tags,
            note
        };
        const newRecent = [
            optimisticEntry,
            ...recent
        ].slice(0, 10);
        setRecent(newRecent);
        try {
            localStorage.setItem('recentLogs', JSON.stringify(newRecent));
        } catch  {}
        try {
            const res = await fetch('/api/logs', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            if (!res.ok) throw new Error('Failed');
            // on success, clear transient if quick-tap
            if (auto) {
                setTags([]);
                setNote('');
            }
        } catch (err) {
            console.error(err);
            setMessage('Failed to log — try again');
            // rollback optimistic cache
            const rolled = recent;
            setRecent(rolled);
            try {
                localStorage.setItem('recentLogs', JSON.stringify(rolled));
            } catch  {}
        }
    }
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].container,
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].row,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].bigButton,
                        onClick: ()=>{
                            setBehavior('ENERGY');
                            // quick-tap: one-tap logging with default value
                            submitLog(true);
                        },
                        children: "⚡ Energy"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 97,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].bigButton,
                        onClick: ()=>{
                            setBehavior('MOOD');
                            submitLog(true);
                        },
                        children: "🙂 Mood"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 108,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                lineNumber: 96,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].form,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                        children: "Selected"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 120,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].info,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "Behavior: ",
                                    behavior ?? '—'
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                                lineNumber: 122,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    "Value: ",
                                    value,
                                    " — ",
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("em", {
                                        children: SEMANTIC_LABEL(value)
                                    }, void 0, false, {
                                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                                        lineNumber: 124,
                                        columnNumber: 30
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                                lineNumber: 123,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 121,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                        htmlFor: "valueRange",
                        children: "Adjust value"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 128,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: "valueRange",
                        "aria-label": "Value",
                        type: "range",
                        min: 1,
                        max: 10,
                        value: value,
                        onChange: (e)=>setValue(Number(e.target.value))
                    }, void 0, false, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 129,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].rangeLabels,
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "1–3 drained"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                                lineNumber: 140,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "4–6 stable"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                                lineNumber: 141,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "7–8 energized"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                                lineNumber: 142,
                                columnNumber: 11
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("span", {
                                children: "9–10 peak"
                            }, void 0, false, {
                                fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                                lineNumber: 143,
                                columnNumber: 11
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 139,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                        htmlFor: "expectedRange",
                        children: [
                            "Expected (optional) — ",
                            expectedValue ?? '—'
                        ]
                    }, void 0, true, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 146,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        id: "expectedRange",
                        "aria-label": "Expected value",
                        type: "range",
                        min: 1,
                        max: 10,
                        value: expectedValue ?? 7,
                        onChange: (e)=>setExpectedValue(Number(e.target.value))
                    }, void 0, false, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 147,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                        children: "Quick tags"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 157,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tagsRow,
                        children: [
                            'Home',
                            'Campus',
                            'Work',
                            'Outside'
                        ].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: tags.includes(t) ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tagActive : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tag,
                                onClick: ()=>toggleTag(t),
                                type: "button",
                                children: t
                            }, t, false, {
                                fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                                lineNumber: 160,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 158,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                        children: "State tags"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 171,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tagsRow,
                        children: [
                            'Alone',
                            'With people'
                        ].map((t)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                className: tags.includes(t) ? __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tagActive : __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].tag,
                                onClick: ()=>toggleTag(t),
                                type: "button",
                                children: t
                            }, t, false, {
                                fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                                lineNumber: 174,
                                columnNumber: 13
                            }, this))
                    }, void 0, false, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 172,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("label", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].label,
                        children: "Note (optional)"
                    }, void 0, false, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 185,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {
                        value: note,
                        onChange: (e)=>setNote(e.target.value)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 186,
                        columnNumber: 9
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].actions,
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                            disabled: !behavior,
                            onClick: ()=>submitLog(false),
                            className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].save,
                            children: "Save Log"
                        }, void 0, false, {
                            fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                            lineNumber: 189,
                            columnNumber: 11
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                        lineNumber: 188,
                        columnNumber: 9
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                lineNumber: 119,
                columnNumber: 7
            }, this),
            message && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$components$2f$quicklog$2e$module$2e$css__$5b$app$2d$client$5d$__$28$css__module$29$__["default"].toast,
                children: message
            }, void 0, false, {
                fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
                lineNumber: 199,
                columnNumber: 19
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/SentinelOS/client/components/QuickLog.tsx",
        lineNumber: 95,
        columnNumber: 5
    }, this);
}
_s(QuickLog, "y1Cy4oC6xdDnJJjDDzNrm3r4rhM=");
_c1 = QuickLog;
var _c, _c1;
__turbopack_context__.k.register(_c, "SEMANTIC_LABEL");
__turbopack_context__.k.register(_c1, "QuickLog");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
"[project]/Desktop/SentinelOS/client/components/InsightsPanel.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>InsightsPanel
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/SentinelOS/client/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/Desktop/SentinelOS/client/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_context__.k.signature();
"use client";
;
function InsightsPanel() {
    _s();
    const [insights, setInsights] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])([]);
    const [analysis, setAnalysis] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    const [loading, setLoading] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(false);
    async function load(force = false) {
        setLoading(true);
        try {
            const url = '/api/insights' + (force ? '?force=true' : '');
            const res = await fetch(url);
            const data = await res.json();
            setInsights(data.insights || []);
            setAnalysis(data.analysis || null);
        } catch (err) {
            console.error(err);
        } finally{
            setLoading(false);
        }
    }
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "InsightsPanel.useEffect": ()=>{
            load();
        }
    }["InsightsPanel.useEffect"], []);
    if (loading) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: "Loading insights…"
    }, void 0, false, {
        fileName: "[project]/Desktop/SentinelOS/client/components/InsightsPanel.tsx",
        lineNumber: 27,
        columnNumber: 23
    }, this);
    if (!insights || insights.length === 0) return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: "No insights available yet."
    }, void 0, false, {
        fileName: "[project]/Desktop/SentinelOS/client/components/InsightsPanel.tsx",
        lineNumber: 28,
        columnNumber: 50
    }, this);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("h4", {
                children: "Insights"
            }, void 0, false, {
                fileName: "[project]/Desktop/SentinelOS/client/components/InsightsPanel.tsx",
                lineNumber: 32,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                onClick: ()=>load(true),
                children: "Refresh"
            }, void 0, false, {
                fileName: "[project]/Desktop/SentinelOS/client/components/InsightsPanel.tsx",
                lineNumber: 33,
                columnNumber: 7
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("ul", {
                children: insights.map((ins, i)=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("li", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("strong", {
                                children: ins.priority?.toUpperCase() ?? ''
                            }, void 0, false, {
                                fileName: "[project]/Desktop/SentinelOS/client/components/InsightsPanel.tsx",
                                lineNumber: 37,
                                columnNumber: 13
                            }, this),
                            " — ",
                            ins.message,
                            ins.recommendation && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$Desktop$2f$SentinelOS$2f$client$2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                style: {
                                    color: '#666'
                                },
                                children: ins.recommendation
                            }, void 0, false, {
                                fileName: "[project]/Desktop/SentinelOS/client/components/InsightsPanel.tsx",
                                lineNumber: 38,
                                columnNumber: 36
                            }, this)
                        ]
                    }, i, true, {
                        fileName: "[project]/Desktop/SentinelOS/client/components/InsightsPanel.tsx",
                        lineNumber: 36,
                        columnNumber: 11
                    }, this))
            }, void 0, false, {
                fileName: "[project]/Desktop/SentinelOS/client/components/InsightsPanel.tsx",
                lineNumber: 34,
                columnNumber: 7
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/Desktop/SentinelOS/client/components/InsightsPanel.tsx",
        lineNumber: 31,
        columnNumber: 5
    }, this);
}
_s(InsightsPanel, "Ki8M5JpFxEpEDSepClzjydBBh4g=");
_c = InsightsPanel;
var _c;
__turbopack_context__.k.register(_c, "InsightsPanel");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=Desktop_SentinelOS_client_components_0f6e8b82._.js.map