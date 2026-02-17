import { ArrowRight, ArrowUpRight, Clock, Layers } from "lucide-react";
import type { Route } from "./+types/home";
import Navbar from "components/Navbar";
import Footer from "components/Footer";
import Button from "components/ui/Button";
import Upload from "components/Upload";
import { useNavigate } from "react-router";
import { useEffect, useRef, useState } from "react";
import { createProject, getProjects } from "lib/puter.action";

// export function meta({}: Route.MetaArgs) {
//   return [
//     { title: "New React Router App" },
//     { name: "description", content: "Welcome to React Router!" },
//   ];
// }

export default function Home() {

  const navigate = useNavigate();

  const [projects, setProjects] = useState<DesignItem[]>([]);

  const isCreatingProjectRef = useRef(false);

  useEffect(()=>{
      const fetchProjects = async ()=>{
        const items = await getProjects()

        setProjects(items)
      }

      fetchProjects()
  },[])


  const handleUploadComplete = async (base64Image: string) => {

    try {
      if (isCreatingProjectRef.current) return false;
      isCreatingProjectRef.current = true

      const newId = Date.now().toString();
      const name = `Residence ${newId}`

      const newItem = {
        id: newId,
        name,
        sourceImage: base64Image,
        renderedImage: undefined,
        timestamp: Date.now(),
      }

      const saved = await createProject({ item: newItem, visibility: "private" });

      if (!saved) {
        console.error("Failed to create project");
        return false;
      }

      setProjects((prev) => [saved, ...prev]);

      navigate(`/visualizer/${newId}`, {
        state: {
          initialImage: saved.sourceImage,
          initialRendered: saved.renderedImage || null,
          name
        }
      });
      return true;
    }
    finally{
      isCreatingProjectRef.current = false;
    }
  }

  return (
    <div className="home">

      <Navbar />

      <section className="hero">
        <div className="announce">
          <div className="dot">
            <div className="pulse"></div>
          </div>

          <p>Introducing Structify 2.0</p>

        </div>

        <h1>Build beautiful spaces at the speed of thought with Roomify</h1>

        <p className="subtitle">
          STRUCTIFY IS AN AI-FIRST DESIGN ENVIRONMENT THAT HELPS YOU VISUALIZE,
          RENDER, AND SHIP ARCHITECTURAL PROJECTS FASTER THAN EVER.
        </p>

        <div className="actions">
          <a href="#upload" className="cta">
            Start Building <ArrowRight className="icon" />
          </a>

          <Button variant="outline" size="lg" className="demo">
            Watch Demo
          </Button>

        </div>


        <div id="upload" className="upload-shell">
          <div className="grid-overlay" />

          <div className="upload-card m-auto mt-15">
            <div className="upload-head">
              <div className="upload-icon">
                <Layers className="icon" />
              </div>

              <h2>Upload Your Floor Plan</h2>
              <p>Support JPG, PNG, formats upto 10MB</p>
            </div>

            {/* <p>Upload Images</p> */}
            <Upload onComplete={handleUploadComplete}
            />

          </div>

        </div>

      </section>

      <section className="projects">
        <div className="section-inner">
          <div className="section-head">
            <div className="copy">
              <h2>Projects</h2>
              <p>
                Your latest work and shared community projects, all in one place
              </p>
            </div>
          </div>


          <div className="projects-grid">
            {projects.map(({ id, name, renderedImage, sourceImage, timestamp }) => (


              <div key={id} className="project-card group" onClick={()=>navigate(`/visualizer/${id}`)}>
                <div className="preview">
                  <img src={renderedImage || sourceImage} alt="project" />

                  <div className="badge">
                    <span>Community</span>
                  </div>

                </div>

                <div className="card-body">
                  <div>
                    <h3>{name}</h3>

                    <div className="meta">
                      <Clock size={12} />
                      <span>{new Date(timestamp).toLocaleDateString()}</span>
                      <span>By Shahzaib</span>
                    </div>
                  </div>

                  <div className="arrow">
                    <ArrowUpRight size={18} />
                  </div>

                </div>




              </div>
            ))}

          </div>

        </div>
      </section>

      <Footer/>

    </div>
  )
}
