"use client";
import Link from "next/link";
import { useState, useEffect } from "react";
import {
  PencilLine,
  Check,
  MicVocal,
  ArrowDownNarrowWide,
  AudioLines,
  UserCheck,
  AlignLeft,
  CloudUpload,
  Earth,
  BookText,
  Music4,
  JapaneseYen,
} from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { ModeToggle } from "@/components/mode";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";

export default function UploadPage() {
  const [title, setTitle] = useState("");
  const [artist, setArtist] = useState("");
  const [category, setCategory] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [lrcFile, setLrcFile] = useState<File | null>(null);
  const [staticLyrics, setStaticLyrics] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const router = useRouter();
  const handleNotice = () => {
    toast("此應用程式的內容皆由使用者上傳，請遵守版權規範。");
  };
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !artist || !category || !file) {
      toast.error("請填入所有必填項目");
      return;
    }
    if (!agreedToTerms) {
      toast.error("請同意上傳條款和隱私政策");
      return;
    }
    const validateFileExtension = (
      file: File | null,
      expectedExtension: string
    ) => {
      if (!file) return true; // 如果文件是可選的，允許為空
      const extension = file.name.split(".").pop()?.toLowerCase();
      return extension === expectedExtension;
    };

    if (!validateFileExtension(file, "mp3")) {
      toast.error("音樂檔案僅支援 MP3 格式");
      return;
    }

    if (lrcFile && !validateFileExtension(lrcFile, "lrc")) {
      toast.error("動態歌詞檔案僅支援 LRC 格式");
      return;
    }
    const loadingToast = toast.loading("請稍後...");

    setIsUploading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("artist", artist);
    formData.append("category", category);
    formData.append("file", file);
    if (lrcFile) formData.append("lrcFile", lrcFile);
    if (staticLyrics) formData.append("staticLyrics", staticLyrics);

    try {
      const response = await fetch("/api/songs", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        toast.dismiss(loadingToast);
        throw new Error("上傳失敗");
      }

      const data = await response.json();
      toast.dismiss(loadingToast);
      toast.success("歌曲上傳成功！");
      router.push("/");
    } catch (error) {
      toast.dismiss(loadingToast);
      console.error("上傳錯誤：", error);
      toast.error("上傳失敗，請稍後再試");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="flex h-screen">
        <Card className={cn("w-[380px] m-auto")}>
          <CardHeader>
            <CardTitle>
              <div className="flex items-center">
                上傳歌曲&nbsp;&nbsp;&nbsp;
                <ModeToggle />
                &nbsp;&nbsp;&nbsp;
                <Button onClick={handleNotice}>免責聲明</Button>
              </div>
            </CardTitle>
            <CardDescription>目前僅支援 MP3 檔案</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="grid gap-4">
              <div>
                <label
                  htmlFor="title"
                  className="flex flex-row items-center mb-1"
                >
                  <PencilLine className="h-4 w-4" />
                  &nbsp;歌曲名稱
                </label>
                <Input
                  id="title"
                  type="text"
                  placeholder="輸入歌曲名稱"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="artist"
                  className="flex flex-row items-center mb-1"
                >
                  <UserCheck className="h-4 w-4" />
                  &nbsp;歌手
                </label>
                <Input
                  id="artist"
                  type="text"
                  placeholder="輸入歌手名稱"
                  value={artist}
                  onChange={(e) => setArtist(e.target.value)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="category"
                  className="flex flex-row items-center mb-1"
                >
                  <ArrowDownNarrowWide className="h-4 w-4" />
                  &nbsp;類型
                </label>
                <Select onValueChange={setCategory} required>
                  <SelectTrigger>
                    <SelectValue placeholder="選擇歌曲分類" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="western">🌐&nbsp;西洋樂</SelectItem>
                    <SelectItem value="chinese">🧧&nbsp;中國樂</SelectItem>
                    <SelectItem value="japanese">🍙&nbsp;日本樂</SelectItem>
                    <SelectItem value="just-music">🎵&nbsp;純音樂</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label
                  htmlFor="file"
                  className="flex flex-row items-center mb-1"
                >
                  <AudioLines className="h-4 w-4" />
                  &nbsp;MP3 檔案
                </label>
                <Input
                  id="file"
                  type="file"
                  accept=".mp3"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  required
                />
              </div>
              <div>
                <label
                  htmlFor="lrcFile"
                  className="flex flex-row items-center mb-1"
                >
                  <MicVocal className="h-4 w-4" />
                  &nbsp;LRC 動態歌詞檔 (可選)
                </label>
                <Input
                  id="lrcFile"
                  type="file"
                  accept=".lrc"
                  onChange={(e) => setLrcFile(e.target.files?.[0] || null)}
                />
              </div>
              <div>
                <label
                  htmlFor="staticLyrics"
                  className="flex flex-row items-center mb-1"
                >
                  <AlignLeft className="h-4 w-4" />
                  &nbsp;靜態歌詞 (可選)
                </label>
                <Textarea
                  id="staticLyrics"
                  value={staticLyrics}
                  onChange={(e) => setStaticLyrics(e.target.value)}
                  rows={5}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="terms"
                  checked={agreedToTerms}
                  onCheckedChange={(checked) =>
                    setAgreedToTerms(checked as boolean)
                  }
                />
                <label
                  htmlFor="terms"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  我有權上傳這首歌曲
                </label>
              </div>
            </CardContent>
            <CardFooter>
              <div className="flex flex-col w-full">
                <Button
                  className="w-full mb-2"
                  type="submit"
                  disabled={isUploading}
                >
                  <CloudUpload className="mr-2 h-4 w-4" />
                  &nbsp;
                  {isUploading ? "上傳中..." : "上傳到雲端"}
                </Button>
                <Separator />
                <Link href="/">
                  <Button className="dark:bg-green-500 w-full mt-2">
                    回首頁
                  </Button>
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </div>
    </>
  );
}
