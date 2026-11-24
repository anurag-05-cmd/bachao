# Bachao

Bachao turns a syllabus into a study pack that fits the time left before an exam. Open the study desk for the next topic, a reason to start there and a time budget. Add notes to ground the explanations and previous-year papers to see which skills recur.

The first launch opens a clearly labelled, pre-generated DBMS sample. **Add materials** opens the live upload workspace. A failed analysis keeps your materials available for retry.

## Windows setup

Use Windows 11, Node.js 22.14 or later and a current Edge or Chrome browser. These PowerShell commands use the existing project folder.

If Node is missing, install it and reopen PowerShell:

```powershell
winget install --id OpenJS.NodeJS.LTS --exact
```

Before a clean install, stop any running Bachao preview or dev server with Ctrl+C. On Windows it can hold Rollup’s native module open and cause npm to report EPERM. Then install the dependencies and launch the production build:

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

Make four selectable-text PDFs in the ignored `.cache/reel` folder. These are original synthetic DBMS sources. This command runs locally and requires no model.

```powershell
Set-Location 'D:\internships\OpenAI\Bachao'
npm.cmd run demo:files
```

1. Open **Add materials**. Upload the synthetic syllabus under **Syllabus**, the six-page revision notes under **Notes & slides**, and both exam PDFs under **Previous-year papers**. Open a source to show the extracted page. **Build my study pack** runs the separate live Ollama path.
2. For the repeatable offline take, choose **Start fresh recording sample**. The **Pre-generated sample** label stays visible as you scroll. The recording sample and uploaded draft have independent histories. Starting another take resets only the recording sample after confirmation.
3. Show **Start here** on the ten-day desk. Normalization starts with a 25-minute block, a worked example and a five-question Topic Test. Select **90 min**. The first block becomes 18 minutes of compact notes with a three-question Quick Check. The sprint schedules 66 minutes across two topics and defers four.
4. Choose **Read compact notes → Jump to Test Me → Quick Check · 3**. Select **Make building part of every key** for the first question and **A room determines its building** for the second. Write the Booking and Room relations for the third. Submit and compare the written answer with the marking points. The first answer’s feedback explains why changing the key still repeats the building.
5. **Retry missed questions (1)** opens just that item. For the reel, select **Show my next block** before correcting it. The desk brings forward an eight-minute revision block with the missed concept. Reloading restores the pack and results.
6. Open **PYQ insights → Decompose a relation using dependencies** and select **Read source page** for the 2023 question. The original page highlights its exact wording. The card also shows the 2024 paraphrase and counts two distinct papers.
7. To show the practice paper, open **Expected paper → Generate practice paper**. Section A offers two 5-mark questions with one required. Section B requires one 8-mark question. The attempted total is 13. Open a generated question’s marking guide.

## Local data and troubleshooting

The browser saves source files, extracted pages, settings, packs, quizzes and results in IndexedDB for this browser profile and origin. Use the same browser and the same loopback URL when returning. **Delete pack** removes that saved pack and its test history. The draft stays available for another analysis. **Materials → Delete all local study data** clears the saved workspace after confirmation. Originals at their existing filesystem locations remain yours. Built assets, PDF worker, icons and typography all work locally. The YouTube link is the optional online feature.

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
npm.cmd run test:upload
npm.cmd run test:reel
```

The browser check starts a separate temporary loopback server for the production bundle and opens headless Edge in an isolated profile. For installed Google Chrome, set `$env:BACHAO_BROWSER='chrome'`.

The native Windows 11 Home verification used Node 22.14.0 and headless Edge. A clean installation, production build and 18 automated tests passed. The tests covered page extraction, unreadable pages, distinct-paper counts, separate skills within a topic, priority switching, quiz keys and the arithmetic of paper choices. Contradictory totals and unequal-mark alternatives produced a practice set.

`test:upload` used real PDF.js extraction with four synthetic DBMS files, including two distinct past papers. It added a renamed duplicate, rejected an invalid PDF, exercised syllabus-only generation, restored state after reload and deleted one pack while retaining another. Missing-model, malformed-output and successful retry responses used a simulated Ollama transport with the production validator. The separate browser suite also tested pasted notes and the pre-generated sample.

`test:reel` generated the four PDFs, uploaded them from disk and ran the recording sequence in a 390 × 844 viewport. It confirmed zero inference requests and verified the highlighted source text. Desktop checks used 1280 × 880. To save local screenshots of synthetic data, set `$env:BACHAO_CAPTURE='1'` before the browser and reel checks. They write to the ignored `.cache/qa` directory.

To include a genuine four-file inference attempt in the upload check, set `$env:BACHAO_TRY_LIVE='1'` before running `npm.cmd run test:upload`. It reports elapsed time to the first study block on success, or the actual runtime error. On this host the genuine request reached Bachao and returned **Cannot reach Ollama**. No runtime was listening on port 11434. There is no measured inference time or real-model quality result for this run.

To run the real inference check, start Bachao and Ollama, install the model and run the following in another terminal:

```powershell
Set-Location 'D:\internships\OpenAI\Bachao'
npm.cmd run test:ollama
```

This sends a tiny original syllabus through the running app and validates the returned topic references. Set `$env:BACHAO_MODEL` to test another installed model. The independent syllabus-only live check also reported the unavailable runtime. CPU performance on the target Vivobook remains unverified.

## Implementation references

- PDF.js supplies the bundled PDF parser and worker under Apache-2.0. [Repository and license](https://github.com/mozilla/pdf.js) · [Official examples](https://mozilla.github.io/pdf.js/examples/)
- Ollama is MIT licensed. Bachao uses its loopback HTTP API with JSON Schema and validates results in Node. [Repository and license](https://github.com/ollama/ollama) · [Structured outputs](https://docs.ollama.com/capabilities/structured-outputs)
- StudyAgent was reviewed for its notes-to-quiz and missed-answer flow, and StudyForge for source-grounded review. Neither inspected repository displayed a license. Bachao’s implementation, interface, examples and questions were written independently. [StudyAgent](https://github.com/whatincode/StudyAgent) · [StudyForge](https://github.com/Sccaryboi1999/StudyForge)
