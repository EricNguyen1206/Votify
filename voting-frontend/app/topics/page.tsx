"use client";

import { useCallback, useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import CustomDialog from "@/components/Dialog";
import CreateTopicForm from "@/components/CreateTopicForm";
import api from "@/lib/api";
import Image from "next/image";
import Link from "next/link";

interface Topic {
  id: string;
  title: string;
  description: string;
  start_time: string;
  end_time: string;
  thumbnail_url: string;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchTopics = useCallback(
    () => async () => {
      try {
        const response = await api.get("/topics");
        console.log("TEST", response.data);
        setTopics(response.data);
      } catch (error) {
        console.error("Failed to fetch topics:", error);
      }
    },
    []
  );

  const getTopics = async () => {
    console.log("TEST");
    const response = await fetch("http://localhost:8080/api/v1/topics", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJlbWFpbCI6InVzZXIxQGV4YW1wbGUuY29tIiwiZXhwIjoxNzQzMDk2ODk2LCJzdWIiOjF9.kRmSx2hPNJ41oyAagoZne62lP4tG0ye2mbEPBjPpA4c`,
      },
    });
    const data = await response.json();
    console.log("TEST response", data);
    return data;
  };

  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Topics</h1>
      <button className="p-2 bg-amber-400 border-2 rounded-2xl" onClick={getTopics}>
        Refresh
      </button>
      <div className="flex justify-between mb-4">
        <Input
          placeholder="Search topics..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="max-w-md"
        />
        <CustomDialog trigger={<Button>Create Topic</Button>} title="Create Topic">
          <CreateTopicForm onSuccess={fetchTopics} />
        </CustomDialog>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {topics.map((topic) => (
          <Link href={`/topics/${topic.id}`} key={topic.id}>
            <div className="p-4 border rounded hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold">{topic.title}</h2>
              <p className="text-gray-600 mb-2">{topic.description}</p>
              <div className="text-sm text-gray-500 mb-2">
                <p>Start: {new Date(topic.start_time).toLocaleString()}</p>
                <p>End: {new Date(topic.end_time).toLocaleString()}</p>
              </div>
              {topic.thumbnail_url && (
                <div className="relative h-48">
                  <Image src={topic.thumbnail_url} alt={topic.title} fill className="object-cover rounded-md" />
                </div>
              )}
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
