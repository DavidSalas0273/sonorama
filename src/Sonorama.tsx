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
		if (playlist.size === 0) {
			defaultSongs.forEach(song => playlist.append(song));
			setSongs(playlist.toArray());
			setCurrentSong(defaultSongs[3]); // Hey Jude como canción actual
			setCurrentNode(playlist.findNode(4));
		}
	}, []);

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
	const filteredSongs = songs.filter((song: Song) =>
		song.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
		song.artist.toLowerCase().includes(searchTerm.toLowerCase()) ||
		song.album.toLowerCase().includes(searchTerm.toLowerCase())
	);

	const favoritesList = songs.filter((song: Song) => song.isFavorite);

	return (
		<div className="min-h-screen bg-gray-50">
			{/* Header */}
			<header className="bg-white border-b border-gray-200 px-6 py-4">
				<div className="flex items-center justify-between">
					<div className="flex items-center space-x-3">
						<div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
							<Music className="w-6 h-6 text-white" />
						</div>
						<div className="flex items-center space-x-2">
							<Music className="w-5 h-5 text-gray-600" />
							<h1 className="text-xl font-semibold text-gray-900">Sonorama</h1>
						</div>
					</div>
					<span className="text-sm text-gray-500">{songs.length} canciones</span>
				</div>
			</header>

			<div className="flex">
				{/* Panel principal */}
				<div className="flex-1 p-6">
					{/* Sección Reproduciendo Ahora */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
						<div className="flex items-center space-x-2 mb-4">
							<Play className="w-4 h-4 text-blue-500" />
							<span className="text-sm font-medium text-gray-700">Reproduciendo</span>
							{currentSong?.isFavorite && <Star className="w-4 h-4 text-yellow-500 fill-current" />}
						</div>
            
						<div className="flex items-center space-x-4 mb-6">
							<div className="w-16 h-16 bg-blue-500 rounded-lg flex items-center justify-center">
								<Music className="w-8 h-8 text-white" />
							</div>
							<div>
								<h3 className="font-semibold text-lg text-gray-900">
									{currentSong?.title || "Ninguna canción seleccionada"}
								</h3>
								<p className="text-gray-600">{currentSong?.artist}</p>
								<p className="text-sm text-gray-500">
									{currentSong?.album} • {currentSong?.duration}
								</p>
							</div>
						</div>

						{/* Controles de reproducción */}
						<div className="flex items-center justify-center space-x-4">
							<button
								onClick={toggleShuffle}
								className={`p-2 rounded-lg border ${isShuffled ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-300'}`}
							>
								<Shuffle className="w-4 h-4" />
							</button>
              
							<button
								onClick={prevSong}
								className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
							>
								<SkipBack className="w-4 h-4" />
							</button>
              
							<button
								onClick={playPause}
								className="p-3 rounded-lg bg-blue-500 text-white hover:bg-blue-600"
							>
								{isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
							</button>
              
							<button
								onClick={nextSong}
								className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
							>
								<SkipForward className="w-4 h-4" />
							</button>
              
							<button
								onClick={stopSong}
								className="p-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:bg-gray-50"
							>
								<Square className="w-4 h-4" />
							</button>
              
							<button
								onClick={toggleRepeat}
								className={`p-2 rounded-lg border ${repeatMode !== 'off' ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-600 border-gray-300'}`}
							>
								<Repeat className="w-4 h-4" />
								{repeatMode === 'one' && (
									<span className="absolute -mt-1 -mr-1 text-xs">1</span>
								)}
							</button>
						</div>
					</div>

					{/* Barra de búsqueda */}
					<div className="flex space-x-2 mb-6">
						<div className="flex-1 relative">
							<Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
							<input
								type="text"
								placeholder="Buscar por título, artista o álbum..."
								value={searchTerm}
								onChange={(e) => setSearchTerm(e.target.value)}
								className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
							/>
						</div>
						<button
							onClick={addSong}
							className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center space-x-2"
						>
							<Plus className="w-4 h-4" />
							<span>Agregar Canción</span>
						</button>
					</div>

					{/* Lista de Reproducción */}
					<div className="bg-white rounded-lg shadow-sm border border-gray-200">
						<div className="p-4 border-b border-gray-200 flex items-center space-x-2">
							<Music className="w-4 h-4 text-orange-500" />
							<h2 className="font-semibold text-gray-900">Lista de Reproducción</h2>
						</div>
            
						<div className="divide-y divide-gray-100">
							{(searchTerm ? filteredSongs : songs).map((song, index) => (
								<div
									key={song.id}
									className={`p-4 flex items-center space-x-4 hover:bg-gray-50 cursor-pointer ${
										currentSong?.id === song.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
									}`}
									onClick={() => playSong(song)}
								>
									<span className="text-sm text-gray-500 w-6">{index + 1}</span>
									<div className="flex-1">
										<div className="flex items-center space-x-2">
											<h3 className="font-medium text-gray-900">{song.title}</h3>
											<button
												onClick={(e) => {
													e.stopPropagation();
													toggleFavorite(song.id);
												}}
												className="text-gray-400 hover:text-yellow-500"
											>
												<Star className={`w-4 h-4 ${song.isFavorite ? 'text-yellow-500 fill-current' : ''}`} />
											</button>
										</div>
										<p className="text-sm text-gray-600">{song.artist} • {song.album}</p>
									</div>
									<span className="text-sm text-gray-500">{song.duration}</span>
								</div>
							))}
						</div>
					</div>
				</div>

				{/* Panel lateral */}
				<div className="w-80 bg-white border-l border-gray-200 p-6">
					{/* Información sobre Sonorama */}
					<div className="mb-6 p-4 bg-gray-50 rounded-lg">
						<h3 className="font-semibold text-gray-900 mb-2">Acerca de Sonorama</h3>
						<p className="text-sm text-gray-600 mb-2">
							Lista de reproducción inteligente con estructura de datos de listas dobles. 
							Disfruta de una experiencia musical fluida y organizada.
						</p>
						<p className="text-xs text-gray-500">
							<span className="inline-block mr-1">⚡</span>
							Desarrollado con React + TypeScript
						</p>
					</div>

					{/* Estadísticas */}
					<div className="mb-6">
						<h3 className="font-semibold text-gray-900 mb-4">Estadísticas</h3>
						<div className="space-y-3">
							<div className="flex justify-between items-center">
								<span className="text-sm text-gray-600">Total de canciones</span>
								<span className="font-semibold text-gray-900">{songs.length}</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-gray-600">Favoritas</span>
								<span className="font-semibold text-yellow-600">{favoritesList.length}</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-gray-600">Reproducción aleatoria</span>
								<span className="text-sm text-gray-400">
									{isShuffled ? 'Activada' : 'Desactivada'}
								</span>
							</div>
							<div className="flex justify-between items-center">
								<span className="text-sm text-gray-600">Repetir</span>
								<span className="text-sm text-gray-400">
									{repeatMode === 'off' ? 'Desactivado' : 
									 repeatMode === 'all' ? 'Todas' : 'Una'}
								</span>
							</div>
						</div>
					</div>

					{/* Lista de Favoritos */}
					<div>
						<div className="flex items-center space-x-2 mb-4">
							<Star className="w-4 h-4 text-yellow-500 fill-current" />
							<h3 className="font-semibold text-gray-900">Favoritos</h3>
						</div>
            
						<div className="space-y-3">
							{favoritesList.map((song) => (
								<div
									key={`fav-${song.id}`}
									className="flex items-center space-x-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
									onClick={() => playSong(song)}
								>
									<Star className="w-3 h-3 text-yellow-500 fill-current flex-shrink-0" />
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-gray-900 truncate">{song.title}</p>
										<p className="text-xs text-gray-500 truncate">{song.artist}</p>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Sonorama;
