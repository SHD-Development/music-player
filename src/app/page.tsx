"use client";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import {
  SkipForward,
  SkipBack,
  Play,
  Pause,
  Volume2,
  Upload,
  MicVocal,
  X,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
  CommandShortcut,
} from "@/components/ui/command";
import Link from "next/link";
interface Song {
  id: string;
  title: string;
  artist: string;
  category: string;
  filePath: string;
  lyricsPath: string | null;
  staticLyrics: string | null;
}

export default function HomePage() {
  const [songs, setSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLyric, setCurrentLyric] = useState("");
  const [category, setCategory] = useState("");
  const [searchedSongs, setSearchedSongs] = useState<Song[]>([]);
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isLyricsPanelOpen, setIsLyricsPanelOpen] = useState(false);
  const toggleLyricsPanel = () => setIsLyricsPanelOpen(!isLyricsPanelOpen);

  useEffect(() => {
    fetchSongs();
  }, []);

  useEffect(() => {
    if (category) {
      setFilteredSongs(songs.filter((song) => song.category === category));
    } else {
      setFilteredSongs(songs);
    }
  }, [category, songs]);

  const fetchSongs = async () => {
    const response = await fetch("/api/songs");
    const data = await response.json();
    setSongs(data);
    setFilteredSongs(data);
  };
  const playRandomSong = () => {
    if (filteredSongs.length > 0) {
      const randomIndex = Math.floor(Math.random() * filteredSongs.length);
      const randomSong = filteredSongs[randomIndex];
      playSong(randomSong);
    }
  };
  const playSong = (song: Song) => {
    setCurrentSong(song);
    setIsPlaying(true);
    if (audioRef.current) {
      audioRef.current.src = song.filePath;
      audioRef.current.play();
    }
    if (song.lyricsPath) {
      fetchLyrics(song.lyricsPath);
    } else {
      setLyrics([]);
      setCurrentLyric(song.staticLyrics || "");
    }
  };

  const fetchLyrics = async (lyricsPath: string) => {
    const response = await fetch(lyricsPath);
    const text = await response.text();
    const parsedLyrics = parseLRC(text);
    setLyrics(parsedLyrics);
  };

  const parseLRC = (lrc: string) => {
    const lines = lrc.split("\n");
    const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2,3})\]/;
    return lines
      .map((line) => {
        const match = timeRegex.exec(line);
        if (match) {
          const time =
            parseInt(match[1]) * 60 +
            parseFloat(match[2]) +
            parseFloat(match[3]) / 1000;
          const text = line.replace(timeRegex, "").trim();
          return { time, text };
        }
        return null;
      })
      .filter((item): item is { time: number; text: string } => item !== null);
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      updateLyrics(audioRef.current.currentTime);
    }
  };
  function formatTime(timeInSeconds: any) {
    const roundedTime = Math.round(timeInSeconds);
    const minutes = Math.floor(roundedTime / 60);
    const seconds = roundedTime % 60;
    const formattedMinutes = minutes.toString().padStart(2, "0");
    const formattedSeconds = seconds.toString().padStart(2, "0");
    return `${formattedMinutes}:${formattedSeconds}`;
  }
  const updateLyrics = (time: number) => {
    const currentLyric = lyrics.reduce((prev, curr) => {
      if (curr.time <= time) {
        return curr;
      }
      return prev;
    }, lyrics[0]);

    if (currentLyric) {
      setCurrentLyric(currentLyric.text);
    }
  };

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0] / 100;
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const handleSeek = (value: number[]) => {
    const newTime = value[0];
    setCurrentTime(newTime);
    if (audioRef.current) {
      audioRef.current.currentTime = newTime;
    }
  };

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const playNext = () => {
    if (currentSong) {
      const currentIndex = filteredSongs.findIndex(
        (song) => song.id === currentSong.id
      );
      const nextSong = filteredSongs[(currentIndex + 1) % filteredSongs.length];
      playSong(nextSong);
    }
  };

  const playPrevious = () => {
    if (currentSong) {
      const currentIndex = filteredSongs.findIndex(
        (song) => song.id === currentSong.id
      );
      const previousSong =
        filteredSongs[
          (currentIndex - 1 + filteredSongs.length) % filteredSongs.length
        ];
      playSong(previousSong);
    }
  };
  const [searchTerm, setSearchTerm] = useState("");
  useEffect(() => {
    let searched = songs;

    if (searchTerm) {
      searched = searched.filter(
        (song) =>
          song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          song.artist.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // if (category) {
    //   filtered = filtered.filter((song) => song.category === category);
    // }

    setSearchedSongs(searched);
  }, [category, songs, searchTerm]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);
  const handleSearch = (value: string) => {
    const searched = songs.filter(
      (song) =>
        song.title.toLowerCase().includes(value.toLowerCase()) ||
        song.artist.toLowerCase().includes(value.toLowerCase())
    );
    setSearchedSongs(searched);
  };
  return (
    <div className="p-4 min-h-screen">
      <div className="mb-4">
        <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
          <DialogContent className="p-0">
            <Command>
              <CommandInput placeholder="搜尋歌曲或歌手..." />
              <CommandList>
                {searchedSongs.map((song) => (
                  <CommandItem
                    key={song.id}
                    onSelect={() => {
                      playSong(song);
                      setIsSearchOpen(false);
                    }}
                  >
                    {song.title} - {song.artist}
                  </CommandItem>
                ))}
              </CommandList>
            </Command>
          </DialogContent>
        </Dialog>
        {/* <label htmlFor="category" className="block mb-1">
          歌曲分類
        </label> */}
        <div className="flex flex-row">
          <Link href="/upload">
            <Button className="mr-5 dark:bg-green-500 hover:ring-2 ring-offset-2 ring-offset-zinc-900 ring-blue-400 w-28">
              <Upload className="h-4 w-4" />
              &nbsp;上傳歌曲
            </Button>
          </Link>
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
          <Button
            className="ml-5 hover:ring-2 ring-offset-2 ring-offset-zinc-900 ring-blue-400 w-28"
            onClick={() => setIsSearchOpen(true)}
          >
            搜尋&nbsp;
            <kbd className="bg-blue-500 pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">Ctrl</span>K
            </kbd>
          </Button>
        </div>
      </div>
      <ScrollArea className="h-[calc(100vh-250px)] mb-4 overflow-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 overflow-visible p-3">
          {filteredSongs.map((song) => (
            <div
              key={song.id}
              className="bg-blue-800 p-4 rounded-lg cursor-pointer hover:bg-green-800 transition duration-300 hover:ring-2 ring-offset-2 ring-offset-zinc-900 w-full ring-white hover:scale-[1.03]"
              onClick={() => playSong(song)}
            >
              <h3 className="font-bold">{song.title}</h3>
              <p className="text-gray-400">{song.artist}</p>
            </div>
          ))}
        </div>
      </ScrollArea>

      <div className="fixed bottom-6 h-40 left-6 right-6 bg-zinc-950 p-6 rounded-lg shadow-2xl ring-zinc-700 ring-2 flex items-center justify-center">
        {(currentSong && (
          <div className="w-full flex items-center justify-between">
            {/* text-center mb-2 */}
            <div className="flex flex-col w-24 lg:w-36 justify-center">
              <h3 className="font-bold">{currentSong.title}</h3>
              <p className="text-gray-400">{currentSong.artist}</p>
              <Button
                variant="outline"
                size="icon"
                className="w-16 h-8 mt-2"
                onClick={toggleLyricsPanel}
              >
                <MicVocal className="h-4 w-4" />
                &nbsp;歌詞
              </Button>
            </div>
            {/* <div className="text-center h-16 overflow-y-auto">
              {currentLyric}
            </div> */}
            <div className="w-1/3 lg:w-1/2 flex flex-row">
              <p className="text-xs hidden lg:block">
                {formatTime(currentTime)}
              </p>
              <Slider
                value={[currentTime]}
                max={duration}
                step={0.1}
                onValueChange={handleSeek}
                className="w-full mx-2"
              />
              <p className="text-xs hidden lg:block">{formatTime(duration)}</p>
            </div>
            <div className="flex flex-col w-24 lg:w-32 justify-center items-center">
              <div className="flex flex-row">
                <Button
                  onClick={playPrevious}
                  variant="rounded"
                  className="justify-center items-center flex hover:scale-125"
                  size="icon"
                >
                  <SkipBack className="h-4 w-4" strokeWidth={2.5} />
                </Button>
                <Button
                  onClick={togglePlay}
                  variant="rounded"
                  className="justify-center items-center flex mx-1 hover:scale-125"
                  size="icon"
                >
                  {isPlaying ? (
                    <Pause className="h-4 w-4" strokeWidth={2.5} />
                  ) : (
                    <Play className="h-4 w-4" strokeWidth={2.5} />
                  )}
                </Button>
                <Button
                  onClick={playNext}
                  variant="rounded"
                  className="justify-center items-center flex hover:scale-125"
                  size="icon"
                >
                  <SkipForward className="h-4 w-4" strokeWidth={2.5} />
                </Button>
              </div>
              <div className="flex flex-row mt-3 w-32 group items-center">
                <Volume2
                  className="h-4 w-4 group-hover:text-green-500 mr-1 transition duration-300"
                  strokeWidth={3}
                />
                <Slider
                  value={[volume * 100]}
                  max={100}
                  onValueChange={handleVolumeChange}
                  className="w-20"
                />
                <p className="text-xs group-hover:text-green-500 ml-1 transition duration-300">
                  {Math.round(volume * 100)}%
                </p>
              </div>
            </div>
          </div>
        )) || (
          <>
            沒有正在播放的音樂
            <Button variant="link" onClick={playRandomSong}>
              隨便來一首？
            </Button>
          </>
        )}
      </div>
      {isLyricsPanelOpen && (
        <div
          className={`fixed top-0 right-0 w-96 h-full bg-zinc-900 p-4 
          }`}
        >
          <Button
            variant="outline"
            size="icon"
            className="absolute top-2 right-2"
            onClick={() => setIsLyricsPanelOpen(false)}
          >
            <X className="h-4 w-4" />
          </Button>
          <h2 className="text-xl font-bold mb-4 flex flex-row items-center">
            <MicVocal className="h-5 w-5" />
            &nbsp;歌詞
          </h2>

          <h3 className="text-zinc-500 overflow-y-auto">
            目前：{currentLyric}
          </h3>
          <div className="h-[calc(100%-100px)] overflow-y-auto">
            <ScrollArea className="h-full w-full rounded-md">
              {lyrics.map((lyric, index) => (
                <div
                  key={index}
                  className={`mb-2 ${
                    lyric.text === currentLyric ? "text-green-500" : ""
                  } transition duration-1000`}
                >
                  {lyric.text}
                </div>
              ))}
            </ScrollArea>
          </div>
        </div>
      )}
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={() =>
          audioRef.current && setDuration(audioRef.current.duration)
        }
        onEnded={playNext}
      />
    </div>
  );
}
