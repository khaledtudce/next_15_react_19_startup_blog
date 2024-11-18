import { formatDate } from "@/lib/utils";
import { client } from "@/sanity/lib/client";
import {
  PLAYLIST_BY_SLUG_QUERY,
  STAERTUPS_BY_ID_QUERY,
} from "@/sanity/lib/queries";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import React, { Suspense } from "react";
import markdownit from "markdown-it";
import { Skeleton } from "@/components/ui/skeleton";
import View from "@/components/View";
import StartupCard, { StartupTypeCard } from "@/components/StartupCard";

const md = markdownit();

export const experimental_ppr = true;

const page = async ({ params }: { params: Promise<{ id: string }> }) => {
  const id = (await params).id;

  //sequential fetch
  /*const post = await client.fetch(STAERTUPS_BY_ID_QUERY, { id });
  const { select: editorPosts } = await client.fetch(PLAYLIST_BY_SLUG_QUERY, {
    slug: "editor-picks1",
  });*/

  //parallel fetch: faster load
  const [post, { select: editorPosts }] = await Promise.all([
    client.fetch(STAERTUPS_BY_ID_QUERY, { id }),
    client.fetch(PLAYLIST_BY_SLUG_QUERY, {
      slug: "editor-pick-new",
    }),
  ]);

  if (!post) {
    return notFound;
  }

  const parsedContent = md.render(post?.pitch || "");

  return (
    <>
      <section className="pink_container !min-h-[230px]">
        <p className="tag">{formatDate(post?._createAt)}</p>
        <h1 className="heading"> {post?.title}</h1>
        <p className="sub-heading !max-w-5xl">{post?.description}</p>
      </section>
      <section className="section_container">
        <Image
          src={post.image}
          alt="thumbnail"
          className="w-full h-auto rounded-xl"
          width={800}
          height={400}
        ></Image>
        <div className="space-y-5 mt-10 max-w-4xl mx-auto">
          <div className="flex-between gap-5">
            <Link
              href={`/user/${post.author?._id}`}
              className="flex gap-2 items-center mb-3"
            >
              <Image
                src={post.author.image}
                alt="Avatar"
                width={64}
                height={64}
                className="rounded-full drop-shadow-lg"
              />

              <div>
                <p className="text-20-medium">{post.author.name}</p>
                <p className="text-16-medium !text-black-300">
                  @{post.author.username}
                </p>
              </div>
            </Link>
            <p className="category-tag">{post.category}</p>
          </div>
          <h3 className="text-30-bold">Startup Details</h3>
          {parsedContent ? (
            <article
              className="prose max-w-4xl font-work-sans break-all"
              dangerouslySetInnerHTML={{ __html: parsedContent }}
            />
          ) : (
            <p className="no-result">No details provided</p>
          )}
        </div>

        <hr className="divider" />

        {/* Editor selected start ups */}
        {editorPosts?.length > 0 && (
          <div className="maxw-4xl mx-auto">
            <p className="text-30-semibold">Editor picks</p>
            <ul className="mt-7 card_grid-sm">
              {editorPosts.map((post: StartupTypeCard, i: number) => (
                <StartupCard key={i} post={post} />
              ))}
            </ul>
          </div>
        )}

        <Suspense fallback={<Skeleton className="view_skeleton" />}>
          <View id={id} />
        </Suspense>
      </section>
    </>
  );
};

export default page;
