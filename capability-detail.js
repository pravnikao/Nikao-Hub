/* Capability popover content.
 *
 * The cards on the Our capabilities tab carry a short summary. This file holds
 * the longer detail the popover shows: a description, three delivery steps,
 * what we deliver, the value, and a conceptual scene drawn in three beats that
 * match the three steps.
 *
 * Scene rules, enforced by the verification harness:
 *   - every <text> label appears verbatim (case-insensitive) somewhere in that
 *     capability's own popover copy, so the picture never says anything the
 *     words do not;
 *   - no digits anywhere in a scene, so nothing reads as a measurement;
 *   - every viewBox is 360 wide and labels are 14 units, which keeps rendered
 *     label text above 12px at every width the scene is given.
 */
window.CAPABILITY_DETAIL = [
  {
    number: "01",
    title: "Quality strategy &amp; independent assurance",
    description: "Bring clarity to coverage, ownership and release readiness. We define risk-led strategies and turn test evidence into a clear view of progress and remaining risk.",
    steps: [
      { label: "Risk-led strategy", title: "Set the direction", text: "Agree critical journeys, assurance gaps and responsibilities before execution." },
      { label: "Independent challenge", title: "Assess the evidence", text: "Review supplier coverage and completion evidence against the agreed scope." },
      { label: "Decision support", title: "Explain readiness", text: "Make open risks, quality gates and required actions visible to decision-makers." }
    ],
    deliver: [
      "Test strategy, maturity reviews and requirements traceability",
      "Supplier oversight and evidence assessment",
      "Quality gates, completion evidence and executive reporting"
    ],
    value: "Clearer release decisions, supported by evidence.",
    scene: `<svg viewBox="0 0 360 260" role="presentation" aria-hidden="true" focusable="false">
      <g data-beat="1"><g class="beat">
        <path class="ln dw" pathLength="1" d="M20 26h78v78H20z"/>
        <path class="ln dw" pathLength="1" d="M46 26v78M72 26v78M20 52h78M20 78h78"/>
        <path class="hl dw" pathLength="1" d="M72 26h26v26H72z"/>
        <path class="hl dw" pathLength="1" d="M72 52h26v26H72z"/>
        <text class="lbl" x="116" y="60">Critical journeys</text>
      </g></g>
      <g data-beat="2"><g class="beat">
        <text class="lbl" x="340" y="128" text-anchor="end">Agreed scope</text>
        <path class="ln dw" pathLength="1" stroke-dasharray="4 4" d="M300 140v54"/>
        <path class="fl dw" pathLength="1" d="M20 158h232"/>
        <path class="fl dw" pathLength="1" d="M20 182h280"/>
      </g></g>
      <g data-beat="3"><g class="beat">
        <path class="hl dw" pathLength="1" d="M20 222l8 8 16-16"/>
        <text class="lbl" x="54" y="228">Quality gates</text>
        <circle class="hl" cx="252" cy="222" r="6" fill="none"/>
        <circle class="hl" cx="274" cy="222" r="6" fill="none"/>
        <text class="lbl" x="340" y="228" text-anchor="end">Open risks</text>
      </g></g>
    </svg>`
  },
  {
    number: "02",
    title: "Functional &amp; end-to-end testing",
    description: "Validate the journeys that matter to customers, advisers and operations. Structured testing and exploration cover everyday behaviour, exceptions and dependencies.",
    steps: [
      { label: "Business context", title: "Design the journeys", text: "Translate product rules and customer needs into expected outcomes and exception scenarios." },
      { label: "Connected testing", title: "Exercise the platform", text: "Test across everyday journeys and dependencies, supported by structured exploration." },
      { label: "Acceptance evidence", title: "Confirm the result", text: "Investigate defects and provide business acceptance evidence for the agreed scope." }
    ],
    deliver: [
      "Business journey and scenario design",
      "Exploratory and regression testing",
      "Business acceptance support"
    ],
    value: "Confidence in complete customer and operational journeys.",
    scene: `<svg viewBox="0 0 360 260" role="presentation" aria-hidden="true" focusable="false">
      <g data-beat="1"><g class="beat">
        <text class="lbl" x="20" y="44">Customers</text>
        <text class="lbl" x="20" y="96">Advisers</text>
        <text class="lbl" x="20" y="148">Operations</text>
        <path class="ln dw" pathLength="1" d="M20 52h320M20 104h320M20 156h320"/>
        <path class="ln dw" pathLength="1" stroke-dasharray="4 4" d="M140 52l30 30"/>
        <path class="ln dw" pathLength="1" stroke-dasharray="4 4" d="M230 104l30 30"/>
        <text class="lbl" x="20" y="200">Exception scenarios</text>
      </g></g>
      <g data-beat="2"><g class="beat">
        <path class="fl dw" pathLength="1" d="M20 56h120l30 52h70l30 52h60"/>
        <path class="ln" d="M164 102h12v12h-12z"/>
        <path class="ln" d="M264 154h12v12h-12z"/>
        <text class="lbl" x="20" y="224">Everyday journeys</text>
        <text class="lbl" x="196" y="224">Dependencies</text>
      </g></g>
      <g data-beat="3"><g class="beat">
        <circle class="hl" cx="330" cy="160" r="11" fill="none"/>
        <path class="hl dw" pathLength="1" d="M325 160l4 4 7-8"/>
        <text class="lbl" x="20" y="248">Acceptance evidence</text>
      </g></g>
    </svg>`
  },
  {
    number: "03",
    title: "Test automation &amp; continuous quality",
    description: "Build automation that fits delivery. We combine UI checks for critical interactions with API and data validation, connecting maintainable suites to delivery pipelines.",
    steps: [
      { label: "Automation design", title: "Shape the coverage", text: "Select repeatable checks at UI, API and data layers according to business risk." },
      { label: "Maintainable execution", title: "Build & integrate", text: "Develop reusable frameworks and connect reliable checks to delivery pipelines." },
      { label: "Sustainable capability", title: "Strengthen ownership", text: "Review suite health and equip existing teams to maintain and extend automation." }
    ],
    deliver: [
      "UI and API automation frameworks",
      "Existing-suite assessment and improvement",
      "CI/CD integration, coaching and handover"
    ],
    value: "Reliable regression and earlier feedback on change.",
    scene: `<svg viewBox="0 0 360 260" role="presentation" aria-hidden="true" focusable="false">
      <g data-beat="1"><g class="beat">
        <path class="ln dw" pathLength="1" d="M20 22h180v30H20z"/>
        <path class="ln dw" pathLength="1" d="M20 58h180v30H20z"/>
        <path class="ln dw" pathLength="1" d="M20 94h180v30H20z"/>
        <text class="lbl" x="34" y="42">UI</text>
        <text class="lbl" x="34" y="78">API</text>
        <text class="lbl" x="34" y="114">Data</text>
        <circle class="hl" cx="174" cy="37" r="5" fill="none"/>
        <circle class="hl" cx="174" cy="73" r="5" fill="none"/>
        <circle class="hl" cx="174" cy="109" r="5" fill="none"/>
      </g></g>
      <g data-beat="2"><g class="beat">
        <path class="fl dw" pathLength="1" d="M200 37h36v113M200 73h36M200 109h36"/>
        <path class="ln dw" pathLength="1" d="M20 150h320v26H20z"/>
        <path class="fl dw" pathLength="1" d="M40 163h280"/>
        <text class="lbl" x="20" y="200">Delivery pipelines</text>
      </g></g>
      <g data-beat="3"><g class="beat">
        <text class="lbl" x="20" y="226">Suite health</text>
        <path class="ln dw" pathLength="1" d="M20 238h150"/>
        <path class="hl dw" pathLength="1" d="M20 238h96"/>
        <circle class="ln" cx="242" cy="230" r="8" fill="none"/>
        <circle class="ln" cx="264" cy="230" r="8" fill="none"/>
        <circle class="ln" cx="286" cy="230" r="8" fill="none"/>
        <text class="lbl" x="212" y="254">Existing teams</text>
      </g></g>
    </svg>`
  },
  {
    number: "04",
    title: "API, integration &amp; data assurance",
    description: "Follow the transaction beyond the screen. Validate interfaces, feeds, transformations and downstream outputs across connected platforms and services.",
    steps: [
      { label: "Integration context", title: "Map the handoffs", text: "Identify interfaces, feeds and data transformations supporting critical transactions." },
      { label: "Connected checks", title: "Validate the behaviour", text: "Check API contracts, files and records against expected business outcomes." },
      { label: "Data confidence", title: "Reconcile the outputs", text: "Investigate differences and confirm downstream outputs remain consistent." }
    ],
    deliver: [
      "API and integration testing",
      "File and feed validation",
      "Data integrity, transformation and reconciliation checks"
    ],
    value: "Greater confidence in cross-system data and transactions.",
    scene: `<svg viewBox="0 0 360 260" role="presentation" aria-hidden="true" focusable="false">
      <g data-beat="1"><g class="beat">
        <path class="fl dw" pathLength="1" d="M56 40v144"/>
        <circle class="ln" cx="56" cy="40" r="9" fill="none"/>
        <circle class="ln" cx="56" cy="88" r="9" fill="none"/>
        <circle class="ln" cx="56" cy="136" r="9" fill="none"/>
        <circle class="ln" cx="56" cy="184" r="9" fill="none"/>
        <text class="lbl" x="78" y="46">Interfaces</text>
        <text class="lbl" x="78" y="94">Feeds</text>
        <text class="lbl" x="78" y="142">Records</text>
        <text class="lbl" x="78" y="190">Downstream outputs</text>
      </g></g>
      <g data-beat="2"><g class="beat">
        <path class="hl dw" pathLength="1" d="M18 64l6 6 12-12"/>
        <path class="hl dw" pathLength="1" d="M18 112l6 6 12-12"/>
        <path class="hl dw" pathLength="1" d="M18 160l6 6 12-12"/>
        <text class="lbl" x="226" y="70">API contracts</text>
      </g></g>
      <g data-beat="3"><g class="beat">
        <path class="ln dw" pathLength="1" stroke-dasharray="3 5" d="M56 30v-10h288v196H56v-10"/>
        <path class="hl dw" pathLength="1" d="M332 102h24M332 114h24"/>
        <text class="lbl" x="56" y="244">Reconcile the outputs</text>
      </g></g>
    </svg>`
  },
  {
    number: "05",
    title: "Migration &amp; release assurance",
    description: "Assess complex platform change and migrations. Reconcile transformed data, validate the journeys it supports and establish evidence for rehearsal, cutover and business verification.",
    steps: [
      { label: "Migration validation", title: "Prove the data", text: "Check mappings and transformations, with reconciled financial positions and serviceable records." },
      { label: "Business readiness", title: "Rehearse the change", text: "Exercise migrated journeys, operational acceptance and representative processing volumes." },
      { label: "Cutover assurance", title: "Verify the transition", text: "Assess cutover and rollback evidence, followed by business verification after the move." }
    ],
    deliver: [
      "Migration strategy and traceable acceptance criteria",
      "Mapping, transformation and financial reconciliation checks",
      "End-to-end journeys and operational acceptance on migrated data",
      "Technical dry runs and full business dress rehearsals",
      "Production-scale, cutover and rollback evidence, followed by business verification"
    ],
    value: "Confidence in customer outcomes after the move.",
    scene: `<svg viewBox="0 0 360 260" role="presentation" aria-hidden="true" focusable="false">
      <g data-beat="1"><g class="beat">
        <path class="ln dw" pathLength="1" d="M20 20h30v18H20zM20 48h30v18H20zM20 76h30v18H20z"/>
        <path class="ln dw" pathLength="1" d="M104 20h30v18h-30zM104 48h30v18h-30zM104 76h30v18h-30z"/>
        <path class="hl dw" pathLength="1" d="M64 25h26M64 33h26"/>
        <path class="hl dw" pathLength="1" d="M64 53h26M64 61h26"/>
        <path class="hl dw" pathLength="1" d="M64 81h26M64 89h26"/>
        <text class="lbl" x="148" y="34">Mappings</text>
        <text class="lbl" x="148" y="62">Financial positions</text>
        <text class="lbl" x="148" y="90">Serviceable records</text>
      </g></g>
      <g data-beat="2"><g class="beat">
        <path class="fl dw" pathLength="1" d="M56 122a24 24 0 1 1-17 7"/>
        <path class="fl dw" pathLength="1" d="M39 129l-10-3M39 129l2 10"/>
        <text class="lbl" x="96" y="152">Rehearsal</text>
      </g></g>
      <g data-beat="3"><g class="beat">
        <text class="lbl" x="20" y="196">Cutover</text>
        <path class="fl dw" pathLength="1" d="M20 212h262"/>
        <path class="ln dw" pathLength="1" stroke-dasharray="4 4" d="M170 212v20h112"/>
        <circle class="hl" cx="300" cy="212" r="10" fill="none"/>
        <path class="hl dw" pathLength="1" d="M295 212l4 4 7-8"/>
        <text class="lbl" x="20" y="256">Business verification</text>
        <text class="lbl" x="196" y="256">Rollback evidence</text>
      </g></g>
    </svg>`
  },
  {
    number: "06",
    title: "Performance &amp; operational readiness",
    description: "Understand how the platform behaves under pressure. Shape testing around business peaks, processing volumes and recovery needs alongside engineering and operational teams.",
    steps: [
      { label: "Representative demand", title: "Define the workload", text: "Agree business peaks, batch volumes and operational scenarios with engineering teams." },
      { label: "Performance evidence", title: "Test under pressure", text: "Exercise load, stress and throughput, and investigate constraints affecting service readiness." },
      { label: "Operational confidence", title: "Assess recovery", text: "Validate recovery behaviour and timing against agreed operational acceptance criteria." }
    ],
    deliver: [
      "Load, stress and batch-throughput testing at representative volumes",
      "Business workload and operational exception scenarios",
      "Recovery validation and cutover timing evidence"
    ],
    value: "Evidence of capacity and readiness for business peaks.",
    scene: `<svg viewBox="0 0 360 260" role="presentation" aria-hidden="true" focusable="false">
      <g data-beat="1"><g class="beat">
        <path class="ln dw" pathLength="1" d="M20 200h320"/>
        <path class="ln dw" pathLength="1" d="M44 200v-10M84 200v-10M124 200v-10M164 200v-10M204 200v-10"/>
        <text class="lbl" x="20" y="226">Batch volumes</text>
      </g></g>
      <g data-beat="2"><g class="beat">
        <path class="ln dw" pathLength="1" stroke-dasharray="5 5" d="M20 62h320"/>
        <text class="lbl" x="340" y="52" text-anchor="end">Capacity</text>
        <rect class="zone" x="176" y="62" width="84" height="34"/>
        <path class="fl dw" pathLength="1" d="M20 200l60 -34l54 -58l44 -34h40"/>
        <circle class="hl" cx="218" cy="74" r="7" fill="none"/>
        <text class="lbl" x="110" y="46">Business peaks</text>
        <text class="lbl" x="184" y="118">Stress</text>
      </g></g>
      <g data-beat="3"><g class="beat">
        <path class="fl dw" pathLength="1" d="M258 74l34 60l28 66"/>
        <path class="ln dw" pathLength="1" d="M258 216v8h82v-8"/>
        <text class="lbl" x="258" y="248">Recovery</text>
      </g></g>
    </svg>`
  }
];
