import Button from "components/ui/Button";
import Modal from "components/ui/Modal";
import { generate3DView } from "lib/ai.action";
import { createProject, getProjectById, updateProjectVisibility } from "lib/puter.action";
import { Box, Download, RefreshCcw, Share2, X, Copy, Check } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { ReactCompareSlider, ReactCompareSliderImage } from "react-compare-slider";
import { useLocation, useNavigate, useOutletContext, useParams } from "react-router";

const VisualizerId = () => {

    const { id } = useParams();

    const navigate = useNavigate();

    const location = useLocation();

    const { userId } = useOutletContext<AuthContext>();

    //   const { initialImage, initialRender, name } = location.state || {};

    const hasInitialGenerated = useRef(false);

    const [project, setProject] = useState<DesignItem | null>(null);
    const [isProjectLoading, setIsProjectLoading] = useState(true);

    const [isProcessing, setIsProcessing] = useState(false);
    const [currentImage, setCurrentImage] = useState<string | null>(null);

    // Share functionality state
    const [isShareModalOpen, setIsShareModalOpen] = useState(false);
    const [shareStatus, setShareStatus] = useState<'idle' | 'sharing' | 'unsharing' | 'copied'>('idle');
    const [shareUrl, setShareUrl] = useState<string>('');

    const handleBack = () => navigate("/");

    const runGeneration = async (item: DesignItem) => {
        if (!id || !item.sourceImage) return;

        try {
            setIsProcessing(true);
            const result = await generate3DView({ sourceImage: item.sourceImage });

            if (result.renderedImage) {
                setCurrentImage(result.renderedImage);

                const updatedItem = {
                    ...item,
                    renderedImage: result.renderedImage,
                    renderedPath: result.renderedPath,
                    timestamp: Date.now(),
                    ownerId: item.ownerId ?? userId ?? null,
                    isPublic: item.isPublic ?? false
                }

                const saved = await createProject({ item: updatedItem, visibility: 'private' })

                if (saved) {
                    setProject(saved)
                    setCurrentImage(saved.renderedImage || result.renderedImage)
                }


            } else {
                console.error("Generation failed");
            }
        } catch (error) {
            console.error("Error during generation:", error);
        } finally {
            setIsProcessing(false);
        }
    };

    useEffect(() => {
        let isMounted = true;

        const loadProject = async () => {
            if (!id) {
                setIsProjectLoading(false);
                return;
            }

            setIsProjectLoading(true);

            const fetchedProject = await getProjectById({ id });

            if (!isMounted) return;

            setProject(fetchedProject);
            setCurrentImage(fetchedProject?.renderedImage || null);
            setIsProjectLoading(false);
            hasInitialGenerated.current = false;
        };

        loadProject();

        return () => {
            isMounted = false;
        };
    }, [id]);

    useEffect(() => {
        if (
            isProjectLoading ||
            hasInitialGenerated.current ||
            !project?.sourceImage
        )
            return;

        if (project.renderedImage) {
            setCurrentImage(project.renderedImage);
            hasInitialGenerated.current = true;
            return;
        }

        hasInitialGenerated.current = true;
        void runGeneration(project);
    }, [project, isProjectLoading]);


    const handleExport = () => {
        if (!currentImage) return;
    
        try {
            const link = document.createElement("a");
            link.href = currentImage;
    
            // Try to generate a clean filename
            const fileName = `${project?.name || `roomify-${id}`}.png`;
    
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error("Failed to export image:", error);
        }
    };

    const handleShare = async () => {
        if (!project || !id) return;

        if (project.isPublic) {
            // If already public, show the share modal with existing URL
            setShareUrl(`${window.location.origin}/visualizer/${id}`);
            setIsShareModalOpen(true);
        } else {
            // Make project public
            setShareStatus('sharing');
            try {
                const updatedProject = await updateProjectVisibility({ 
                    id, 
                    visibility: 'public' 
                });
                
                if (updatedProject) {
                    setProject(updatedProject);
                    setShareUrl(`${window.location.origin}/visualizer/${id}`);
                    setIsShareModalOpen(true);
                    setShareStatus('idle');
                } else {
                    console.error('Failed to make project public');
                    setShareStatus('idle');
                }
            } catch (error) {
                console.error('Error sharing project:', error);
                setShareStatus('idle');
            }
        }
    };

    const handleUnshare = async () => {
        if (!project || !id) return;

        setShareStatus('unsharing');
        try {
            const updatedProject = await updateProjectVisibility({ 
                id, 
                visibility: 'private' 
            });
            
            if (updatedProject) {
                setProject(updatedProject);
                setIsShareModalOpen(false);
                setShareUrl('');
                setShareStatus('idle');
            } else {
                console.error('Failed to make project private');
                setShareStatus('idle');
            }
        } catch (error) {
            console.error('Error unsharing project:', error);
            setShareStatus('idle');
        }
    };

    const handleCopyLink = async () => {
        if (!shareUrl) return;

        try {
            await navigator.clipboard.writeText(shareUrl);
            setShareStatus('copied');
            setTimeout(() => setShareStatus('idle'), 2000);
        } catch (error) {
            console.error('Failed to copy link:', error);
        }
    };
    

    return (
        <div className="visualizer">
            <nav className="topbar">
                <div className="brand">
                    <Box className="logo" />

                    <span className="name">Roomify</span>
                </div>

                <Button
                    variant="primary"
                    size="sm"
                    onClick={handleBack}
                    className="exit cursor-pointer"
                >
                    <X className="icon" /> Exit Editor
                </Button>
            </nav>

            <section className="content">
                <div className="panel">
                    <div className="panel-header">
                        <div className="panel-meta">
                            <p>Project</p>
                            <h2>{project?.name || `Residence ${id}`}</h2>
                            <p className="note">Created By You</p>
                        </div>

                        <div className="panel-actions">
                            <Button
                                size="sm"
                                onClick={handleExport}
                                 className="export cursor-pointer"
                                disabled={!currentImage}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Export
                            </Button>

                            <Button 
                                size="sm" 
                                onClick={handleShare} 
                                className="share cursor-not-allowed"
                                // disabled={shareStatus === 'sharing' || shareStatus === 'unsharing'}
                                disabled={true}
                            >
                                <Share2 className="w-4 h-4 mr-2" />
                                {shareStatus === 'sharing' ? 'Sharing...' : 'Share'}
                            </Button>
                        </div>
                    </div>

                    <div className={`render-area ${isProcessing ? "is-processing" : ""}`}>
                        {currentImage ? (
                            <img
                                src={currentImage}
                                alt="rendered view"
                                className="rendered-im"
                            />
                        ) : (
                            <div className="render-placeholder">
                                {project?.sourceImage && (
                                    <img
                                        src={project?.sourceImage}
                                        alt="Original"
                                        className="render-fallback"
                                    />
                                )}
                            </div>
                        )}

                        {isProcessing && (
                            <div className="render-overlay">
                                <div className="rendering-card">
                                    <RefreshCcw className="spinner" />
                                    <span className="title">Rendering ...</span>
                                    <span className="subtitle">
                                        Generating Your 3d Visualization
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                </div>


                        <div className="panel compare">

                            <div className="panel-header">

                                <div className="panel-meta">
                                    <p>Comparison</p>
                                    <h3>Before and After</h3>
                                    <div className="hint">Drag to Compare</div>
                                </div>

                            </div>

                            <div className="compare-stage">
                                {project?.sourceImage && currentImage ?(
                                    <ReactCompareSlider
                                    defaultValue={50}
                                    style={{width: '100%', height: 'auto'}}
                                    itemOne= {
                                        <ReactCompareSliderImage 
                                        src={project?.sourceImage}
                                        alt="before"
                                        className="compare-img"
                                        />
                                    }
                                    itemTwo= {
                                        <ReactCompareSliderImage 
                                        src={currentImage || project?.renderedImage}
                                        alt="after"
                                        className="compare-img"
                                        />
                                    }
                                    />
                                ):(
                                    <div className="compare-fallback">
                                            {project?.sourceImage && (
                                                <img src={project.sourceImage} alt="before" className="compare-img"/>
                                            )}
                                    </div>
                                )}
                            </div>

                        </div>

            </section>

            {/* {initialImage && (
                <div className="image-container">
                    <h2>Source Image</h2>
                    <img src={initialImage} alt="source" />
                </div>
            )} */}

            {/* Share Modal */}
            <Modal
                isOpen={isShareModalOpen}
                onClose={() => setIsShareModalOpen(false)}
                title="Share Project"
                className="share-modal"
            >
                <div className="share-content">
                    <p className="share-description">
                        Anyone with this link can view your project
                    </p>
                    
                    <div className="share-url-container">
                        <input
                            type="text"
                            value={shareUrl}
                            readOnly
                            className="share-url-input"
                        />
                        <Button
                            size="sm"
                            onClick={handleCopyLink}
                            className="copy-button"
                            disabled={shareStatus === 'copied'}
                        >
                            {shareStatus === 'copied' ? (
                                <>
                                    <Check className="w-4 h-4 mr-2" />
                                    Copied!
                                </>
                            ) : (
                                <>
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="share-actions">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={handleUnshare}
                            disabled={shareStatus === 'unsharing'}
                            className="unshare-button"
                        >
                            {shareStatus === 'unsharing' ? 'Unsharing...' : 'Unshare'}
                        </Button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default VisualizerId;
