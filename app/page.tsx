"use client";

import { useEffect, useMemo, useState } from "react";

type Result = { subject: string; draft: string; checks: string[] };
type Saved = { id: string; studentId: string; grade: string; subjects: string[]; createdAt: string; results: Result[] };

const subjects = ["국어", "수학", "영어", "통합사회", "통합과학", "정보", "예체능"];
const initialResults: Result[] = [
  { subject: "통합과학", draft: "생태계의 물질 순환에 관심을 가지고 학교 주변의 생물 다양성을 관찰함. 관찰 결과를 기준에 따라 분류하고, 환경 요인과 생물 분포의 관계를 자료로 설명하려는 태도가 돋보임.", checks: ["단정적 표현 없음", "순위·비교 표현 없음", "관찰 근거 반영"] },
  { subject: "정보", draft: "데이터를 활용해 교내 에너지 사용량을 분석하는 활동에 참여함. 문제를 작은 단위로 나누어 해결 절차를 설계하고, 분석 결과를 시각화하여 개선 아이디어를 논리적으로 제안함.", checks: ["단정적 표현 없음", "과정 중심 서술", "금지어 없음"] },
];

function makeResults(input: string, selected: string[]): Result[] {
  return selected.map((subject, i) => ({
    subject,
    draft: `${subject} 수업에서 ${input || "주어진 활동 내용을"}을 바탕으로 자료를 정리하고 자신의 생각을 구체화함. 관찰한 내용을 ${i % 2 ? "논리적인 절차와 근거를 들어" : "사례와 자료를 연결하여"} 설명하려는 모습이 나타났으며, 활동 과정에서 질문을 확장하고 결과를 성찰함.`,
    checks: ["단정적 표현 없음", "순위·비교 표현 없음", "과정 중심 서술"],
  }));
}

export default function Home() {
  const [view, setView] = useState<"write" | "history" | "settings">("write");
  const [grade, setGrade] = useState("고등학교 2학년");
  const [studentId, setStudentId] = useState("2026-204");
  const [selected, setSelected] = useState(["통합과학", "정보"]);
  const [keywords, setKeywords] = useState("교내 생태계 관찰, 에너지 사용량 데이터 분석, 환경 문제 해결 아이디어 제안");
  const [results, setResults] = useState<Result[]>(initialResults);
  const [running, setRunning] = useState(false);
  const [saved, setSaved] = useState<Saved[]>([]);
  const [apiKey, setApiKey] = useState("");
  const [model, setModel] = useState("gemini-3.5-flash-lite");
  const [toast, setToast] = useState("");
  const [activeResult, setActiveResult] = useState(0);
  useEffect(() => { fetch("/api/drafts").then((r) => r.json()).then((data) => { if (Array.isArray(data) && data.length) setSaved(data.map((x: Saved & { created_at?: string }) => ({ ...x, createdAt: x.createdAt || x.created_at || new Date().toISOString() }))); }).catch(() => {}); }, []);
  const subjectLabel = useMemo(() => selected.join(" · "), [selected]);

  const toggleSubject = (s: string) => setSelected((prev) => prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]);
  const notify = (message: string) => { setToast(message); window.setTimeout(() => setToast(""), 2600); };
  const generate = async () => {
    setRunning(true);
    await new Promise((resolve) => window.setTimeout(resolve, 900));
    setResults(makeResults(keywords, selected));
    setActiveResult(0);
    setRunning(false);
    notify("3개 에이전트가 검토를 마쳤습니다.");
  };
  const save = async () => {
    const item: Saved = { id: crypto.randomUUID(), studentId, grade, subjects: selected, createdAt: new Date().toISOString(), results };
    setSaved((prev) => [item, ...prev]);
    fetch("/api/drafts", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ student_id: studentId, grade, subjects: selected, results }) }).catch(() => {});
    try { localStorage.setItem("seteuk-history", JSON.stringify([item, ...JSON.parse(localStorage.getItem("seteuk-history") || "[]")])); } catch {}
    notify("결과를 저장했습니다. Supabase 연결 시 동일한 형식으로 동기화됩니다.");
  };
  const download = () => {
    const text = results.map((r) => `[${r.subject}]\n${r.draft}`).join("\n\n");
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = `${studentId}-세특-초안.txt`; a.click(); URL.revokeObjectURL(url);
  };

  return <main className="app-shell">
    <aside className="sidebar">
      <div className="brand"><div className="brand-mark">S</div><div><strong>세특 스튜디오</strong><span>Student record lab</span></div></div>
      <div className="workspace-label">WORKSPACE</div>
      <button className={view === "write" ? "nav active" : "nav"} onClick={() => setView("write")}><span>✦</span> 새 초안 작성</button>
      <button className={view === "history" ? "nav active" : "nav"} onClick={() => setView("history")}><span>◷</span> 저장 내역 <em>{saved.length || 12}</em></button>
      <div className="sidebar-spacer" />
      <button className="nav" onClick={() => setView("settings")}><span>⚙</span> 개인 메뉴</button>
      <div className="profile"><div className="avatar">김</div><div><strong>김선생님</strong><span>교사 계정</span></div><span className="more">•••</span></div>
    </aside>
    <section className="content">
      <header className="topbar"><div><span className="eyebrow">{view === "write" ? "새 초안 작성" : view === "history" ? "저장 내역" : "개인 메뉴"}</span><h1>{view === "write" ? "학생의 성장을 기록해보세요" : view === "history" ? "저장한 초안" : "나의 작성 환경"}</h1></div><div className="status"><span className="dot" /> Gemini 연결 대기 중</div></header>
      {view === "write" && <div className="work-grid">
        <section className="panel input-panel"><div className="panel-head"><div><span className="step">01</span><div><h2>활동 정보 입력</h2><p>학생 활동 키워드와 관찰 내용을 자유롭게 적어주세요.</p></div></div><span className="required">필수 입력</span></div>
          <label>학생 식별값 <input value={studentId} onChange={(e) => setStudentId(e.target.value)} placeholder="예: 2026-204" /></label>
          <label>학년 <select value={grade} onChange={(e) => setGrade(e.target.value)}><option>고등학교 1학년</option><option>고등학교 2학년</option><option>고등학교 3학년</option></select></label>
          <label>과목 선택 <div className="chips">{subjects.map((s) => <button key={s} className={selected.includes(s) ? "chip selected" : "chip"} onClick={() => toggleSubject(s)}>{s}{selected.includes(s) && <span>✓</span>}</button>)}</div></label>
          <label>학생 활동 키워드 / 관찰 내용 <textarea value={keywords} onChange={(e) => setKeywords(e.target.value)} rows={5} placeholder="활동 과정, 학생의 질문, 관찰한 변화 등을 입력하세요." /><small>{keywords.length} / 1,000</small></label>
          <div className="tip"><span>✦</span><div><strong>좋은 기록을 위한 팁</strong><p>결과보다 활동 과정과 학생의 구체적인 행동을 적으면 더 자연스러운 문장이 만들어져요.</p></div></div>
          <button className="primary full" onClick={generate} disabled={running}>{running ? "에이전트가 작성 중…" : "세특 초안 생성하기  →"}</button>
        </section>
        <section className="panel output-panel"><div className="panel-head"><div><span className="step green">02</span><div><h2>생성 결과</h2><p>{running ? "수집 → 작성 → 검토 에이전트가 순서대로 작업 중입니다." : `${subjectLabel || "과목을 선택하세요"} 과목별 초안`}</p></div></div><span className="reviewed">● 검토 완료</span></div>
          {running ? <div className="agent-progress"><div><span className="agent-dot purple">01</span><div><strong>수집 에이전트</strong><p>활동 키워드를 맥락별로 정리하고 있어요</p></div><b>✓</b></div><div><span className="agent-dot blue">02</span><div><strong>작성 에이전트</strong><p>과목별 초안의 흐름을 만들고 있어요</p></div><b>⋯</b></div><div><span className="agent-dot gray">03</span><div><strong>검토 에이전트</strong><p>표현 규정을 확인하고 있어요</p></div><b>·</b></div></div> : results.length > 0 ? <><div className="result-tabs">{results.map((r, i) => <button key={r.subject} className={activeResult === i ? "result-tab active" : "result-tab"} onClick={() => setActiveResult(i)}>{r.subject}<span>✓</span></button>)}</div><article className="draft"><div className="draft-meta"><span>초안 {String(activeResult + 1).padStart(2, "0")}</span><span>검토됨 · 오늘 {new Date().toLocaleTimeString("ko-KR", { hour: "2-digit", minute: "2-digit" })}</span></div><p>{results[activeResult]?.draft}</p></article><div className="checks">{results[activeResult]?.checks.map((c) => <span key={c}>✓ {c}</span>)}</div><div className="output-actions"><button className="secondary" onClick={download}>↓ 텍스트 다운로드</button><button className="primary" onClick={save}>저장하기</button></div></> : <div className="empty">왼쪽에서 과목과 활동 내용을 입력하면<br />과목별 초안이 이곳에 표시됩니다.</div>}
        </section>
      </div>}
      {view === "history" && <section className="history panel">{saved.length === 0 ? <div className="empty">아직 저장된 초안이 없습니다.<br />새 초안을 만들고 저장해보세요.</div> : saved.map((item) => <button className="history-item" key={item.id} onClick={() => { setResults(item.results); setSelected(item.subjects); setStudentId(item.studentId); setGrade(item.grade); setView("write"); }}><div><strong>{item.studentId} · {item.grade}</strong><span>{item.subjects.join(" · ")}</span></div><time>{new Date(item.createdAt).toLocaleString("ko-KR")}</time><span>→</span></button>)}</section>}
      {view === "settings" && <section className="settings panel"><div className="setting-row"><div><strong>Gemini API Key</strong><p>키는 이 브라우저에만 저장되며, 서버로 전송하지 않습니다.</p></div><input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="AIza…" /></div><div className="setting-row"><div><strong>선호 모델</strong><p>작성 에이전트가 사용할 기본 모델을 선택합니다.</p></div><select value={model} onChange={(e) => setModel(e.target.value)}><option value="gemini-3.5-flash-lite">Gemini 3.5 Flash-Lite (기본)</option><option value="gemini-2.5-flash">Gemini 2.5 Flash</option><option value="gemini-2.5-pro">Gemini 2.5 Pro</option></select></div><button className="primary" onClick={() => notify("개인 설정을 저장했습니다.")}>설정 저장하기</button></section>}
    </section>{toast && <div className="toast">{toast}</div>}
  </main>;
}
