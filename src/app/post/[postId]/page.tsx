import { Metadata } from "next";
import ClientPostPage from "./ClientPostPage";

async function getPost(id: number) {
  const url = `${process.env.NEXT_PUBLIC_BASE_URL}/api/post/p/${id}/get`;
  const res = await fetch(url, {
    cache: "no-store",
  });

  return await res.json();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ postId: number }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const data = await getPost(Number(resolvedParams.postId));

  return {
    title: data.post.title,
    description: data.post.description,
    openGraph: {
      title: data.post.title,
      description: data.post.description,
      images: [data.post.media_url],
    },
    twitter: {
      card: "summary_large_image",
      title: data.post.title,
      description: data.post.description,
      images: [data.post.media_url],
    },
  };
}

const PostPage = ({ params }: { params: Promise<{ postId: number }> }) => {
  return <ClientPostPage params={params} />;
};

export default PostPage;
