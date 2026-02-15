import { CheckCircle, ImageIcon, UploadIcon } from "lucide-react";
import { useState, useRef } from "react";
import { useOutletContext } from "react-router";

import {
    PROGRESS_INCREMENT,
    PROGRESS_INTERVAL_MS,
    REDIRECT_DELAY_MS,
} from "../lib/constant";

// interface AuthContext {
//   isSignedIn: boolean;
// }

// interface UploadProps {
//   onComplete?: (base64: string) => void;
// }

const Upload = ({ onComplete }: UploadProps) => {
    const [file, setFile] = useState<File | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [progress, setProgress] = useState(0);

    const intervalRef = useRef<number | null>(null);

    const { isSignedIn } = useOutletContext<AuthContext>();

    /* ----------------------------- FILE PROCESS ----------------------------- */

    const processFile = (selectedFile: File) => {
        if (!isSignedIn) return;

        const reader = new FileReader();
        reader.onerror = () => {
            console.error("Error reading file:", reader.error);
            setFile(null);
            setProgress(0);
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        }

        reader.onload = () => {
            const base64 = reader.result as string;

            setProgress(0);

            intervalRef.current = window.setInterval(() => {
                setProgress((prev) => {
                    const next = prev + PROGRESS_INCREMENT;

                    if (next >= 100) {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                        }

                        setTimeout(() => {
                            onComplete?.(base64);
                        }, REDIRECT_DELAY_MS);

                        return 100;
                    }

                    return next;
                });
            }, PROGRESS_INTERVAL_MS);
        };

        reader.readAsDataURL(selectedFile);
    };

    /* ----------------------------- HANDLERS ----------------------------- */

    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/jpg"];

    const isValidFileType = (file: File) => {
        return ALLOWED_TYPES.includes(file.type);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!isSignedIn) return;

        const selectedFile = e.target.files?.[0];
        if (!selectedFile) return;

        if (!isValidFileType(selectedFile)) {
            alert("Only PNG, JPG and JPEG files are allowed.");
            return;
        }

        setFile(selectedFile);
        processFile(selectedFile);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!isSignedIn) return;
        setIsDragging(true);
    };

    const handleDragLeave = () => {
        setIsDragging(false);
    };

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        if (!isSignedIn) return;

        setIsDragging(false);

        const droppedFile = e.dataTransfer.files?.[0];

        if (!droppedFile) return;

        setFile(droppedFile);
        processFile(droppedFile);
    };

    /* ----------------------------- UI ----------------------------- */

    return (
        <div className="upload">
            {!file ? (
                <div
                    className={`dropzone ${isDragging ? "is-dragging" : ""}`}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                    <input
                        type="file"
                        className="drop-input"
                        accept=".jpg,.jpeg,.png"
                        disabled={!isSignedIn}
                        onChange={handleChange}
                    />

                    <div className="drop-content">
                        <div className="drop-icon">
                            <UploadIcon size={20} />
                        </div>

                        <p>
                            {isSignedIn
                                ? "Click to upload or drag and drop"
                                : "Sign in to upload your floor plan."}
                        </p>

                        <p className="help">Maximum file size 50 MB</p>
                    </div>
                </div>
            ) : (
                <div className="upload-status">
                    <div className="status-content">
                        <div className="status-icon">
                            {progress === 100 ? (
                                <CheckCircle className="check" />
                            ) : (
                                <ImageIcon className="image" />
                            )}
                        </div>

                        <h3>{file.name}</h3>

                        <div className="progress">
                            <div className="bar" style={{ width: `${progress}%` }} />

                            <p className="status-text">
                                {progress < 100
                                    ? "Analyzing Floor Plan..."
                                    : "Redirecting..."}
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Upload;
