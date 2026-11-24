# Bachao

Bachao turns a syllabus into a study pack that fits the time left before an exam. Open the study desk for the next topic, a reason to start there and a time budget. Add notes to ground the explanations and previous-year papers to see which skills recur.

The first launch opens a clearly labelled, pre-generated DBMS sample. **Add materials** opens the live upload workspace. A failed analysis keeps your materials available for retry.

## Windows setup

Use Windows 11, Node.js 22.14 or later and a current Edge or Chrome browser. These PowerShell commands use the existing project folder.

If Node is missing, install it and reopen PowerShell:

```powershell
winget install --id OpenJS.NodeJS.LTS --exact
```

Install the dependencies and launch the production build:

```powershell
Set-Location 'D:\internships\OpenAI\Bachao'
npm.cmd ci
npm.cmd run build
npm.cmd start
```

Open [the local study desk](http://127.0.0.1:5173). For later launches, run `npm.cmd start` from the same folder. Use Ctrl+C to stop the server. For development, `npm.cmd run dev` serves the same app and API on that port. Run one server at a time.

### Enable generation from your materials

The sample works immediately. To analyse uploads, install Ollama and download the default model once. In PowerShell:

```powershell
winget install --id Ollama.Ollama --exact
```

Open Ollama from the Start menu. In a fresh PowerShell window:

```powershell
ollama pull qwen3:4b-instruct
ollama list
```

If the background runtime is stopped, run `ollama serve` in its own terminal. The app contacts `127.0.0.1:11434`. Change **Materials → Local Ollama model** to the name of another locally installed instruction model if needed. The default download is approximately 2.5 GB. [Ollama for Windows](https://docs.ollama.com/windows) · [Qwen model entry](https://ollama.com/library/qwen3:4b-instruct)

Bachao targets CPU inference on the i5-13500H / 16 GB laptop. The initial request uses a compact map of up to six topics. It sends up to five syllabus pages, three notes pages and two paper pages, with the first 1,100 characters from each. **Materials → Saved study packs → Analysis coverage** lists the exact excerpts considered. To focus on material outside that window, paste the relevant unit as the syllabus for a new pack. Tests, historical analysis and practice-paper writing run on demand. Successful steps are cached.

## Study from your own material

1. Open **Add materials**. Choose PDFs or expand **Paste text** under each source category. A syllabus is sufficient. Include a source name when pasting individual pages.
2. Open a source in **Source pages** to check its extracted text and page numbers. Scans, blank pages or unreadable files may need a pasted transcription. Each individual PDF can be up to 50 MB.
3. Enter the exam date and actual minutes available per day. Choose **Build my study pack**. The daily plan counts today and the exam date as available study days.
4. Open **Start studying** for short notes, a worked example, important points and an exam-answer outline. The optional **Watch** link opens a labelled YouTube search.
5. Use **Test Me** for a three-question Quick Check or a five-question Topic Test. Thin sources may support fewer questions. The app scores MCQs and records your self-check against marking points for written answers. Retry the missed items. The next recommendation can bring forward an available revision slot.
6. Use **90 min** to concentrate on up to two topics, shorter checks and revision. Read the deferred topics below the plan. **Daily plan** restores the date-based schedule. Both switches use saved topics and perform no inference.

## Previous-year papers

**PYQ insights** processes paper excerpts locally and saves each completed batch. Open a skill to read its verified historical questions, source pages and known metadata. Counts use distinct paper fingerprints. Renamed copies with the same normalized extracted text count once. Keep each paper in its own file or paste entry.

**Expected paper** generates a **PYQ-based practice paper** with a marking guide. The format check requires at least two distinct papers with the same explicit section order, question counts, choices and marks. It understands labelled sections, instructions such as “Answer one of two” and numbered question lines ending in marks. Complex or inconsistent layouts produce a practice set. Generated questions are labelled separately from the historical quotations. This exercise makes no prediction about the next exam.

## DBMS recording sequence

1. Open **Materials → Open sample**. Show the pre-generated label and the synthetic syllabus, notes and two past papers through the topic evidence and PYQ views.
2. On **Study desk**, show the ten-day plan, the first normalization session and its duration. Switch to **90 min** and show the shorter plan and four deferred topics.
3. Choose **Start studying → Quick Check**. Miss one MCQ, submit, self-check the written response and open **Retry missed questions**. Return to the desk to see the revision recommendation. Reload to show saved progress.
4. Open **PYQ insights**. Compare differently worded questions grouped under one skill and open a source page.
5. Open **Expected paper → Generate practice paper**. Show the section choices, generated-question labels and a marking guide.

## Local data and troubleshooting

The browser saves source files, extracted pages, settings, packs, quizzes and results in IndexedDB for this browser profile and origin. Use the same browser and the same loopback URL when returning. **Materials → Delete all local study data** clears the saved workspace after confirmation. Originals at their existing filesystem locations remain yours. Built assets, PDF worker, icons and typography all work locally. The YouTube link is the optional online feature.

| What you see | What to do |
| --- | --- |
| Cannot reach Ollama | Start the Windows Ollama app, or run `ollama serve`, then retry the same step. |
| Model missing | Run `ollama list`, pull the selected model or enter an installed model name. |
| Timeout, invalid JSON or unverified excerpt | Retry with a shorter relevant syllabus or clearer pasted text. Each model request has a four-minute timeout. Completed historical batches and practice questions remain available. |
| A PDF page has no readable text | Paste the page transcription and include its filename and page number in the source name. v1 extracts existing text. |
| Empty saved workspace | Check the browser profile and origin. Browser data clearing and private browsing affect IndexedDB. |
| Port 5173 is in use | Stop the earlier Bachao server with Ctrl+C and relaunch. |

## Verification

From this checkout:

```powershell
npm.cmd test
npm.cmd run build
npm.cmd run test:browser
```

The browser check starts a separate temporary loopback server for the production bundle and opens headless Edge in an isolated profile. For installed Google Chrome, set `$env:BACHAO_BROWSER='chrome'`.

The Windows verification run used Node 22.14.0. A clean `npm.cmd ci`, the production build and 14 automated tests passed. Coverage includes real PDF.js extraction of a generated two-page PDF, blank-page recovery, deduplication, source validation, daily and sprint budgets, quiz scoring, targeted revision, historical quotes, unknown marks and inconsistent paper formats.

The production Edge check exercised PDF upload and pasted text, a 390-pixel portrait viewport, saved quiz results across reload, historical evidence, section choices and marking guides, error recovery, pack caching and deletion. It observed no external HTTP requests from the page. The successful upload-generation fixture in this test supplies a simulated model response.

To run the real inference check, start Bachao and Ollama, install the model and run the following in another terminal:

```powershell
Set-Location 'D:\internships\OpenAI\Bachao'
npm.cmd run test:ollama
```

This sends a tiny original syllabus through the running app and validates the returned topic references. Set `$env:BACHAO_MODEL` to test another installed model. The running production app returned HTTP 200. The real smoke check returned “Cannot reach Ollama” because no runtime was listening on port 11434. Real-model output quality, end-to-end inference time and performance on the target Vivobook remain unverified.

## Implementation references

- PDF.js supplies the bundled PDF parser and worker under Apache-2.0. [Repository and license](https://github.com/mozilla/pdf.js) · [Official examples](https://mozilla.github.io/pdf.js/examples/)
- Ollama is MIT licensed. Bachao uses its loopback HTTP API with JSON Schema and validates results in Node. [Repository and license](https://github.com/ollama/ollama) · [Structured outputs](https://docs.ollama.com/capabilities/structured-outputs)
- StudyAgent was reviewed for its notes-to-quiz and missed-answer flow, and StudyForge for source-grounded review. Neither inspected repository displayed a license. Bachao’s implementation, interface, examples and questions were written independently. [StudyAgent](https://github.com/whatincode/StudyAgent) · [StudyForge](https://github.com/Sccaryboi1999/StudyForge)
