const skills=['Decompose a relation using dependencies','Preserve unmatched rows in a join','Trace a dirty read']
const historical=[
 ['Decompose Booking into relations that remove its transitive dependency.','Write a join that retains students who have no enrolments.','Trace how an uncommitted balance can affect a second transaction.'],
 ['Split a booking table to store each room’s building only once.','How would you list every student, including those without courses?','Use a two-transaction schedule to illustrate a dirty read.']
]
export function sampleHistory() {
 const docs=[],history={}
 historical.forEach((questions,i)=>{
   const year=2023+i,id='paper'+year,name='DBMS exam '+year+' · synthetic'
   const lines=['DBMS exam '+year,'Section A','Answer one of two', '1. '+questions[0]+' [5 marks]','2. '+questions[1]+' [5 marks]','Section B','Answer all','3. '+questions[2]+' [8 marks]']
   docs.push({id,kind:'pyq',name,pages:[{number:1,text:lines.join('\n')}]})
   history[id+':1@0']=questions.map((quote,j)=>({page:id+':1',quote,skill:skills[j]}))
 })
 return {docs,history}
}
export const samplePractice=[
 {prompt:'A repair ticket records ticketID, deskID and floor. Each desk is on one floor. Show a decomposition that avoids repeating the floor.',points:['Identify ticketID → deskID and deskID → floor.','Store Ticket(ticketID, deskID) and Desk(deskID, floor).','Explain how one desk row prevents conflicting floor updates.']},
 {prompt:'A library needs a list of all members and their active loans, including members with no loan. Show the join and describe an unmatched member’s row.',points:['Use Member as the left input.','LEFT JOIN Loan on the member identifier.','Unmatched members have NULL values in loan columns.']},
 {prompt:'A till updates stock from 12 to 9. A report reads 9 before the till rolls back. Trace the schedule and explain what the report observed.',points:['List the write, read and rollback in time order.','Identify the report’s dependence on uncommitted data.','The rollback restores 12. The report used a value that never committed.']}
]
