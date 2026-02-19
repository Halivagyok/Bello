import { useEffect, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import type { DropResult } from '@hello-pangea/dnd';
import { useStore } from '../store';
import TopBar from '../components/TopBar';
import CardList from '../components/CardList';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Plus, Layout, ArrowLeft } from 'lucide-react';

export default function Board() {
    const { boardId } = useParams<{ boardId: string }>();
    const navigate = useNavigate();

    const lists = useStore((state) => state.lists);
    const moveList = useStore((state) => state.moveList);
    const moveCard = useStore((state) => state.moveCard);
    const addList = useStore((state) => state.addList);
    const fetchBoard = useStore((state) => state.fetchBoard);
    const fetchBoards = useStore((state) => state.fetchBoards);
    const fetchProjects = useStore((state) => state.fetchProjects);

    const activeProjectId = useStore((state) => state.activeProjectId);
    const reorderProjectBoards = useStore((state) => state.reorderProjectBoards);
    const projects = useStore((state) => state.projects);
    const boards = useStore((state) => state.boards);
    const projectBoardPage = useStore((state) => state.projectBoardPage);
    const setProjectBoardPage = useStore((state) => state.setProjectBoardPage);

    const prevBoardIdRef = useRef<string | null>(null);

    useEffect(() => {
        fetchBoards();
        fetchProjects();
    }, [fetchBoards, fetchProjects]);

    useEffect(() => {
        if (boardId) {
            fetchBoard(boardId);
        }
        return () => {
            const store = useStore.getState();
            if (boardId) store.unsubscribeFromBoard(boardId);
        }
    }, [boardId, fetchBoard]);

    useEffect(() => {
        if (!boardId || !activeProjectId) return;

        const project = projects.find(p => p.id === activeProjectId);
        if (!project) return;

        const isNewBoard = boardId !== prevBoardIdRef.current;

        if (isNewBoard) {
            const projectBoards = boards.filter(b => b.projectId === activeProjectId);

            if (project.boardIds) {
                projectBoards.sort((a, b) => {
                    const indexA = project.boardIds!.indexOf(a.id);
                    const indexB = project.boardIds!.indexOf(b.id);
                    return indexA - indexB;
                });
            }

            const activeIndex = projectBoards.findIndex(b => b.id === boardId);
            if (activeIndex !== -1) {
                const requiredPage = Math.floor(activeIndex / 7);
                if (requiredPage !== projectBoardPage) {
                    setProjectBoardPage(requiredPage);
                }
                prevBoardIdRef.current = boardId;
            }
        }
    }, [boardId, activeProjectId, boards, projects, projectBoardPage, setProjectBoardPage]);

    const onDragEnd = (result: DropResult) => {
        const { destination, source, type } = result;

        if (!destination) return;

        if (
            destination.droppableId === source.droppableId &&
            destination.index === source.index
        ) {
            return;
        }

        if (type === 'BOARD_TAB') {
            if (!activeProjectId) return;
            const project = projects.find(p => p.id === activeProjectId);
            if (!project) return;

            let projectBoards = boards.filter(b => b.projectId === activeProjectId);

            if (project.boardIds) {
                projectBoards.sort((a, b) => {
                    const indexA = project.boardIds!.indexOf(a.id);
                    const indexB = project.boardIds!.indexOf(b.id);
                    if (indexA === -1) return 1;
                    if (indexB === -1) return -1;
                    return indexA - indexB;
                });
            }

            const currentOrder = projectBoards.map(b => b.id);

            const [movedId] = currentOrder.splice(source.index, 1);
            currentOrder.splice(destination.index, 0, movedId);

            reorderProjectBoards(activeProjectId, currentOrder);
            return;
        }

        if (type === 'list') {
            moveList(source.index, destination.index);
            return;
        }

        moveCard(
            source.droppableId,
            destination.droppableId,
            source.index,
            destination.index
        );
    };

    return (
        <div className="h-screen flex bg-gradient-to-br from-[#0079bf] to-[#5067c5] dark:from-[#0c2b4e] dark:to-[#1d546c] overflow-hidden">
            {/* Sidebar */}
            <aside className="w-[260px] shrink-0 border-r border-white/10 bg-black/15 backdrop-blur-sm flex flex-col p-4">
                <div className="flex items-center gap-2 mb-8 px-2">
                    <Layout className="w-6 h-6 text-white" />
                    <span className="text-xl font-bold text-white tracking-tight">Bello</span>
                </div>

                <nav className="space-y-1">
                    <Button
                        variant="ghost"
                        className="w-full justify-start text-white hover:bg-white/10 gap-2 font-medium"
                        onClick={() => navigate('/boards')}
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Back to Boards
                    </Button>
                </nav>
            </aside>

            {/* Main Content */}
            <DragDropContext onDragEnd={onDragEnd}>
                <main className="flex-1 flex flex-col min-w-0">
                    <div className="p-4 pb-0">
                        <TopBar />
                    </div>
                    
                    <div className="flex-1 flex gap-4 overflow-x-auto overflow-y-hidden p-4 items-start scrollbar-board">
                        <Droppable droppableId="board" direction="horizontal" type="list">
                            {(provided) => (
                                <div
                                    ref={provided.innerRef}
                                    {...provided.droppableProps}
                                    className="flex gap-4 items-start h-full"
                                >
                                    {lists.map((list, index) => (
                                        <div key={list.id}>
                                            <CardList list={list} index={index} />
                                        </div>
                                    ))}
                                    {provided.placeholder}
                                </div>
                            )}
                        </Droppable>

                        <div className="w-[280px] shrink-0">
                            <Button
                                onClick={() => addList("New List")}
                                className="w-full justify-start bg-white/20 hover:bg-white/30 text-white border-0 backdrop-blur-md h-auto py-3 px-4 font-medium"
                            >
                                <Plus className="w-5 h-5 mr-2" />
                                Add another list
                            </Button>
                        </div>
                    </div>
                </main>
            </DragDropContext>
        </div>
    );
}

