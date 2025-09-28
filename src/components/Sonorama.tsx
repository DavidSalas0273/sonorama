import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipForward, SkipBack, Square, Shuffle, Repeat, Plus, Search, Music, Star } from 'lucide-react';

// Interfaz para definir una canción
interface Song {
  id: number;
  title: string;
  artist: string;
  album: string;
  duration: string;
  isFavorite: boolean;
}

// Nodo para la lista doblemente enlazada
class DoublyLinkedListNode {
  data: Song;
  next: DoublyLinkedListNode | null;
  prev: DoublyLinkedListNode | null;

  constructor(data: Song) {
    this.data = data;
    this.next = null;
    this.prev = null;
  }
}

// Implementación de Lista Doblemente Enlazada
class DoublyLinkedList {
  head: DoublyLinkedListNode | null;
  tail: DoublyLinkedListNode | null;
  size: number;

  constructor() {
    this.head = null;
    this.tail = null;
    this.size = 0;
  }

  // Agregar al final
  append(song: Song): void {
    const newNode = new DoublyLinkedListNode(song);
    
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      this.tail!.next = newNode;
      newNode.prev = this.tail;
      this.tail = newNode;
    }
    this.size++;
  }

  // Agregar al inicio
  prepend(song: Song): void {
    const newNode = new DoublyLinkedListNode(song);
    
    if (!this.head) {
      this.head = newNode;
      this.tail = newNode;
    } else {
      newNode.next = this.head;
      this.head.prev = newNode;
      this.head = newNode;
    }
    this.size++;
  }

  // Insertar en posición específica
  insertAt(index: number, song: Song): void {
    if (index < 0 || index > this.size) return;
    
    if (index === 0) {
      this.prepend(song);
      return;
    }
    
    if (index === this.size) {
      this.append(song);
      return;
    }

    const newNode = new DoublyLinkedListNode(song);
    let current = this.head;
    
    for (let i = 0; i < index; i++) {
      current = current!.next;
    }
    
    newNode.next = current;
    newNode.prev = current!.prev;
    current!.prev!.next = newNode;
    current!.prev = newNode;
    this.size++;
  }

  // Eliminar por ID
  remove(id: number): boolean {
    let current = this.head;
    
    while (current) {
      if (current.data.id === id) {
        if (current.prev) {
          current.prev.next = current.next;
        } else {
          this.head = current.next;
        }
        
        if (current.next) {
          current.next.prev = current.prev;
        } else {
          this.tail = current.prev;
        }
        
        this.size--;
        return true;
      }
      current = current.next;
    }
    return false;
  }

  // Convertir a array
  toArray(): Song[] {
    const result: Song[] = [];
    let current = this.head;
    
    while (current) {
      result.push(current.data);
      current = current.next;
    }
    
    return result;
  }

  // Encontrar nodo por ID
  findNode(id: number): DoublyLinkedListNode | null {
    let current = this.head;
    
    while (current) {
      if (current.data.id === id) {
        return current;
      }
      current = current.next;
    }
    
    return null;
  }
}

const Sonorama: React.FC = () => {
  // Estados principales
  const [playlist] = useState(() => new DoublyLinkedList());
  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [currentNode, setCurrentNode] = useState<DoublyLinkedListNode | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [repeatMode, setRepeatMode] = useState<'off' | 'all' | 'one'>('off');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Ref para el estado de actualización
  const updateTrigger = useRef(0);

  // Canciones de ejemplo
  const defaultSongs: Song[] = [
    { id: 1, title: "Bohemian Rhapsody", artist: "Queen", album: "A Night at the Opera", duration: "5:55", isFavorite: true },
    { id: 2, title: "Viva La Vida", artist: "Coldplay", album: "Viva la Vida or Death and All His Friends", duration: "4:02", isFavorite: false },
    { id: 3, title: "Levitating", artist: "Dua Lipa", album: "Future Nostalgia", duration: "3:20", isFavorite: false },
    { id: 4, title: "Hey Jude", artist: "The Beatles", album: "The Beatles 1967-1970", duration: "7:11", isFavorite: true },
    { id: 5, title: "De Música Ligera", artist: "Soda Stereo", album: "Canción Animal", duration: "3:15", isFavorite: false },
    { id: 6, title: "Blinding Lights", artist: "The Weeknd", album: "After Hours", duration: "3:20", isFavorite: true },
    { id: 7, title: "Shape of You", artist: "Ed Sheeran", album: "÷ (Divide)", duration: "3:53", isFavorite: false },
    { id: 8, title: "Someone Like You", artist: "Adele", album: "21", duration: "4:45", isFavorite: true },
    { id: 9, title: "Tu Allá", artist: "Various Artists", album: "Compilation", duration: "3:30", isFavorite: false }
  ];

  // Inicializar playlist
  useEffect(() => {
    defaultSongs.forEach(song => playlist.append(song));
    setSongs(playlist.toArray());
    setCurrentSong(defaultSongs[3]); // Hey Jude como canción actual
    setCurrentNode(playlist.findNode(4));
  }, [playlist]);

  // Función para forzar re-render
  const forceUpdate = () => {
    updateTrigger.current++;
    setSongs(playlist.toArray());
  };

  // Controles de reproducción
  const playPause = () => {
    setIsPlaying(!isPlaying);
  };

  const nextSong = () => {
    if (!currentNode) return;
    
    if (repeatMode === 'one') {
      return; // Mantener la misma canción
    }
    
    let nextNode = currentNode.next;
    
    if (!nextNode && repeatMode === 'all') {
      nextNode = playlist.head;
    }
    
    if (nextNode) {
      setCurrentNode(nextNode);
      setCurrentSong(nextNode.data);
    }
  };

  const prevSong = () => {
    if (!currentNode) return;
    
    if (repeatMode === 'one') {
      return; // Mantener la misma canción
    }
    
    let prevNode = currentNode.prev;
    
    if (!prevNode && repeatMode === 'all') {
      prevNode = playlist.tail;
    }
    
    if (prevNode) {
      setCurrentNode(prevNode);
      setCurrentSong(prevNode.data);
    }
  };

  const stopSong = () => {
    setIsPlaying(false);
  };

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  const toggleRepeat = () => {
    const modes: ('off' | 'all' | 'one')[] = ['off', 'all', 'one'];
    const currentIndex = modes.indexOf(repeatMode);
    setRepeatMode(modes[(currentIndex + 1) % modes.length]);
  };

  const playSong = (song: Song) => {
    const node = playlist.findNode(song.id);
    if (node) {
      setCurrentNode(node);
      setCurrentSong(song);
      setIsPlaying(true);
    }
  };

  const toggleFavorite = (songId: number) => {
    let current = playlist.head;
    while (current) {
      if (current.data.id === songId) {
        current.data.isFavorite = !current.data.isFavorite;
        break;
      }
      current = current.next;
    }
    forceUpdate();
  };

  const addSong = () => {
    if (!searchTerm.trim()) return;
    
    const newSong: Song = {
      id: Date.now(),
      title: searchTerm,
      artist: "Artista Desconocido",
      album: "Álbum Desconocido",
      duration: "3:00",
      isFavorite: false
    };
    
    playlist.append(newSong);
    forceUpdate();
    setSearchTerm('');
  };

  // Filtrar canciones para búsqueda
  const filteredSongs = songs.filter(song =>
    song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.album.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const favoritesList = songs.filter(song => song.isFavorite);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-gray-900 via-gray-800 to-gray-900">
      {/* Header tipo iTunes */}
      <header className="bg-gradient-to-r from-indigo-900 via-blue-900 to-indigo-900 shadow-lg px-8 py-5 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center shadow-lg">
            <Music className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-white tracking-wide drop-shadow">Sonorama</h1>
        </div>
        <span className="text-base text-white/70 font-medium drop-shadow">{songs.length} canciones</span>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Panel lateral oscuro */}
        <aside className="w-64 bg-gradient-to-b from-gray-950 to-gray-800 border-r border-gray-900 flex flex-col p-6 gap-8">
          <nav className="flex flex-col gap-4">
            <button className="flex items-center gap-3 text-white/90 hover:text-blue-400 font-medium text-lg transition">
              <Music className="w-5 h-5" /> Biblioteca
            </button>
            <button className="flex items-center gap-3 text-white/70 hover:text-yellow-400 font-medium text-lg transition">
              <Star className="w-5 h-5" /> Favoritos
            </button>
            <button className="flex items-center gap-3 text-white/70 hover:text-pink-400 font-medium text-lg transition">
              <Plus className="w-5 h-5" /> Agregar
            </button>
          </nav>
          <div className="mt-auto text-xs text-white/40">
            <span>🎵 Inspirado en iTunes</span>
          </div>
        </aside>

        {/* Panel principal */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {/* Barra de búsqueda */}
          <div className="flex items-center gap-3 px-8 py-4 bg-gray-900/80 border-b border-gray-800">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por título, artista o álbum..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-lg bg-gray-800 text-white border border-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400"
              />
            </div>
            <button
              onClick={addSong}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 shadow"
            >
              <Plus className="w-5 h-5" />
              <span>Agregar</span>
            </button>
          </div>

          {/* Lista de canciones tipo tabla */}
          <div className="flex-1 overflow-auto bg-gradient-to-b from-gray-900/80 to-gray-900 px-8 py-4">
            <div className="rounded-lg overflow-hidden shadow-lg border border-gray-800">
              <table className="min-w-full bg-gray-950/80 text-white">
                <thead>
                  <tr className="bg-gray-900/90">
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">#</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Título</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Artista</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Álbum</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider">Duración</th>
                    <th className="px-4 py-3 text-center text-xs font-semibold uppercase tracking-wider">Fav</th>
                  </tr>
                </thead>
                <tbody>
                  {(searchTerm ? filteredSongs : songs).map((song, index) => (
                    <tr
                      key={song.id}
                      className={`transition cursor-pointer ${currentSong?.id === song.id ? 'bg-blue-900/60' : index % 2 === 0 ? 'bg-gray-900/60' : 'bg-gray-950/60'} hover:bg-blue-800/40`}
                      onClick={() => playSong(song)}
                    >
                      <td className="px-4 py-2 text-sm text-gray-400 w-8">{index + 1}</td>
                      <td className="px-4 py-2 font-medium truncate max-w-xs">{song.title}</td>
                      <td className="px-4 py-2 text-gray-300 truncate max-w-xs">{song.artist}</td>
                      <td className="px-4 py-2 text-gray-400 truncate max-w-xs">{song.album}</td>
                      <td className="px-4 py-2 text-gray-400">{song.duration}</td>
                      <td className="px-4 py-2 text-center">
                        <button
                          onClick={e => { e.stopPropagation(); toggleFavorite(song.id); }}
                          className="hover:text-yellow-400"
                        >
                          <Star className={`w-5 h-5 ${song.isFavorite ? 'text-yellow-400 fill-current' : 'text-gray-500'}`} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Barra de reproducción tipo iTunes */}
          <div className="sticky bottom-0 left-0 w-full bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-t border-gray-800 px-8 py-4 flex items-center gap-6 shadow-2xl z-20">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-700 rounded-lg flex items-center justify-center shadow-lg">
                <Music className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-lg text-white">
                  {currentSong?.title || "Ninguna canción seleccionada"}
                </h3>
                <p className="text-gray-300 text-sm">{currentSong?.artist}</p>
                <p className="text-xs text-gray-400">{currentSong?.album} • {currentSong?.duration}</p>
              </div>
              {currentSong?.isFavorite && <Star className="w-5 h-5 text-yellow-400 fill-current ml-2" />}
            </div>
            <div className="flex-1 flex items-center justify-center gap-3">
              <button
                onClick={toggleShuffle}
                className={`p-2 rounded-full border-2 ${isShuffled ? 'bg-blue-700 text-white border-blue-400' : 'bg-gray-900 text-gray-400 border-gray-700'} transition`}
              >
                <Shuffle className="w-5 h-5" />
              </button>
              <button
                onClick={prevSong}
                className="p-2 rounded-full border-2 bg-gray-900 text-gray-400 border-gray-700 hover:bg-gray-800 transition"
              >
                <SkipBack className="w-5 h-5" />
              </button>
              <button
                onClick={playPause}
                className="p-3 rounded-full bg-blue-600 text-white hover:bg-blue-700 shadow-lg transition"
              >
                {isPlaying ? <Pause className="w-7 h-7" /> : <Play className="w-7 h-7" />}
              </button>
              <button
                onClick={nextSong}
                className="p-2 rounded-full border-2 bg-gray-900 text-gray-400 border-gray-700 hover:bg-gray-800 transition"
              >
                <SkipForward className="w-5 h-5" />
              </button>
              <button
                onClick={stopSong}
                className="p-2 rounded-full border-2 bg-gray-900 text-gray-400 border-gray-700 hover:bg-gray-800 transition"
              >
                <Square className="w-5 h-5" />
              </button>
              <button
                onClick={toggleRepeat}
                className={`p-2 rounded-full border-2 ${repeatMode !== 'off' ? 'bg-blue-700 text-white border-blue-400' : 'bg-gray-900 text-gray-400 border-gray-700'} transition`}
              >
                <Repeat className="w-5 h-5" />
                {repeatMode === 'one' && (
                  <span className="absolute -mt-1 -mr-1 text-xs">1</span>
                )}
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default Sonorama;
