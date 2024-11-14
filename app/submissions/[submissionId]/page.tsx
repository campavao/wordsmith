"use server";
import { getPlayerFromId } from "@/app/api/apiUtils";
import { getDocuments } from "@/app/api/firebase/get";
import Link from "next/link";
import { redirect } from "next/navigation";
import getDocument from "../../api/firebase/getData";
import { Preview } from "../../league/[leagueId]/[roundId]/components/Preview";
import { ServerSubmission } from "../../types/FriendLeague";
import { ShareButton } from "../ShareButton";

export default async function SubmissionPage({
  params,
}: {
  params: { submissionId: string };
}) {
  const submissionData = await getDocument("submissions", params.submissionId);

  if (!submissionData.exists()) {
    redirect("/");
  }

  const submission = submissionData.data() as ServerSubmission;
  const author = await getPlayerFromId(submission.playerId);

  const otherSubmissions = await getDocuments<ServerSubmission>(
    "submissions",
    "playerId",
    "==",
    submission.playerId
  );
  const subIndex = otherSubmissions.findIndex(
    (i) => i.id === params.submissionId
  );

  const previousSubmissionId =
    subIndex > 0 && otherSubmissions.at(subIndex - 1)?.id;

  const nextSubmissionId = otherSubmissions.at(subIndex + 1)?.id;

  return (
    <div className='w-full flex flex-col items-center'>
      <blockquote className='max-w-lg italic'>
        <p>{submission.config?.roundPrompt}</p>
      </blockquote>
      <div className='border-b w-10 my-5 self-center'></div>
      <Preview
        className='max-w-md'
        words={submission.text}
        title={submission.title}
        authorName={author?.name}
        isEditable={false}
      />
      <div className='max-w-md w-full grid grid-cols-3 my-8'>
        {previousSubmissionId && (
          <Link
            className='col-start-1'
            href={`/submissions/${previousSubmissionId}`}
          >
            Previous
          </Link>
        )}
        <ShareButton
          className='col-start-2'
          submissionId={params.submissionId}
        />
        {nextSubmissionId && (
          <Link
            className='text-right col-start-3'
            href={`/submissions/${nextSubmissionId}`}
          >
            Next
          </Link>
        )}
      </div>
      <Link href='/'>Back</Link>
    </div>
  );
}
