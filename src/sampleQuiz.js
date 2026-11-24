// Original practice items written for the synthetic DBMS notes.
const banks=[
 [
 ['Which change removes the repeated building fact?',['Make building part of every key','Move room and building into Room','Drop bookingID'],1,'Room stores one building for each room.'],
 ['What does roomID → building mean?',['A room determines its building','A building has only one room','Both columns are candidate keys'],0,'The dependency runs from a room identifier to a building.'],
 ['Outline the decomposition of Booking.',[],null,'Identify bookingID as the key.|Keep Booking(bookingID, roomID).|Store Room(roomID, building).'],
 ['Which fact would a room move require updating after the split?',['Every booking','Every room identifier','One Room record'],2,'The building is stored once per room.'],
 ['State the 3NF test for a nontrivial dependency X → A.',[],null,'X is a superkey, or A is a prime attribute.']
 ],[
 ['Which join retains students without enrolments?',['Inner join','Students LEFT JOIN Enrolments','Cross join'],1,'The left table is preserved.'],
 ['What appears in the missing right-side columns?',['NULL','An empty student record','Zero for every type'],0,'Unmatched right-side values are NULL.'],
 ['Explain how to include students with no course.',[],null,'Put Students on the left.|Use LEFT JOIN with the student identifier as the join condition.'],
 ['What does an inner join return?',['Every left row','Every right row','Matching pairs'],2,'Only rows satisfying the join condition appear.'],
 ['Compare inner and left joins for Mira, who has no enrolments.',[],null,'Mira is absent from the inner join.|The left join retains Mira with NULL course details.']
 ],[
 ['Which read is dirty?',['A read after commit','A read of another transaction’s uncommitted write','A read before a transfer starts'],1,'The writer has not committed.'],
 ['What makes the report of 80 unreliable?',['The writer later rolls back','The report contains a number','The transactions are serial'],0,'A rollback can undo the value the report read.'],
 ['Trace the dependency in the transfer example.',[],null,'One transaction writes 80.|A second reads it before commit.|Rollback invalidates that observed balance.'],
 ['What distinguishes serial execution?',['Only reads are allowed','Every write rolls back','Each transaction finishes before the next begins'],2,'The transactions do not interleave.'],
 ['Explain what isolation controls.',[],null,'It controls which effects of concurrent transactions are visible to each other.']
 ],[
 ['Which property distinguishes a candidate key from a nonminimal superkey?',['Minimality','Being numeric','Being a foreign key'],0,'A candidate key loses uniqueness if an attribute is removed.'],
 ['If roll number alone identifies a student, what is {roll number, name}?',['A necessary composite key','A nonminimal superkey','Always a foreign key'],1,'Name can be removed while retaining uniqueness.'],
 ['Explain how to test a candidate key.',[],null,'Verify uniqueness.|Remove each attribute in turn and check that uniqueness is lost.'],
 ['What does a foreign key reference?',['An arbitrary text field','Only a date column','A key in the related relation'],2,'The referenced key identifies the related row.'],
 ['Why can a unique set of columns fail candidate-key testing?',[],null,'It may contain a removable attribute while another subset still identifies the row.']
 ],[
 ['Which access pattern benefits from an ordered date index?',['Selecting loans in a week','Renaming a table','Dropping all rows'],0,'A week forms a contiguous range of dates.'],
 ['What cost accompanies an index?',['Dates lose ordering','Extra work on writes','All searches become scans'],1,'Inserts and updates can require index maintenance.'],
 ['Justify a loan-date index for a weekly report.',[],null,'The predicate is a date range.|An ordered index can reduce page reads.'],
 ['Which benefit should an exam answer explain?',['Every update is free','The table has fewer rows','The search can read fewer pages'],2,'The index narrows the rows the database needs to examine.'],
 ['Name a trade-off when indexing a frequently updated column.',[],null,'Searches may get cheaper.|Changing indexed values requires maintaining the index.']
 ],[
 ['What records one link between a student and a club?',['A Membership row','The name of every student','An unrelated attribute'],0,'The pair of identifiers represents a membership.'],
 ['What does cardinality describe?',['Row width','How many links may exist at each end','Physical page size'],1,'Cardinality constrains relationship participation counts.'],
 ['Map the student–club relationship to relations.',[],null,'Keep Student and Club with their own keys.|Create Membership(studentID, clubID) for their links.'],
 ['Which pattern fits students joining many clubs and each club having many students?',['One-to-one','Many-to-one only','Many-to-many'],2,'Both ends allow multiple links.'],
 ['Outline an exam answer for a relationship mapping.',[],null,'Name the entities and their keys.|Specify cardinality.|Map the relationship to a relation.']
 ]
]
export function sampleQuiz(topic) {
 return banks[Number(topic.id.slice(1))].map(([prompt,options,answer,guide],i)=>({id:'q'+i,prompt,options,answer,kind:options.length?'mcq':'short',explanation:guide.split('|').join(' '),points:guide.split('|'),refs:topic.refs.filter(r=>r.page.startsWith('n:'))}))
}
