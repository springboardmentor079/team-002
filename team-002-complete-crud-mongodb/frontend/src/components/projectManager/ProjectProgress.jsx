import { useEffect, useState } from "react";
import api from "../../services/api";

function ProjectProgress({ data }) {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // If dashboard data was passed via props, use it directly
    if (Array.isArray(data) && data.length > 0) {
      setProjects(
        data.slice(0, 6).map((project) => ({
          id: project.id || project._id,
          name: project.name,
          progress: Number(project.progress) || 0,
        }))
      );
      setLoading(false);
      return;
    }

    const fetchProjects = async () => {
      try {
        setLoading(true);
        const response = await api.get("/projects");

        if (response.data.success) {
          // Sirf maximum 6 projects chart mein dikhayenge
          const formattedProjects = response.data.data
            .slice(0, 6)
            .map((project) => ({
              id: project._id,
              name: project.name,
              progress: Number(project.progress) || 0,
            }));

          setProjects(formattedProjects);
        }
      } catch (error) {
        console.error(
          "Failed to fetch project progress:",
          error.response?.data || error.message
        );
      } finally {
        setLoading(false);
      }
    };

    fetchProjects();
  }, [data]);

  return (
    <div className="project-progress-card">
      <div className="chart-header">
        <div>
          <h3>Project Progress</h3>
          <p>Live project completion overview</p>
        </div>

        <span className="live-data-text">
          Live Data
        </span>
      </div>

      {loading ? (
        <div className="chart-loading">
          Loading project progress...
        </div>
      ) : projects.length === 0 ? (
        <div className="chart-loading">
          No projects found
        </div>
      ) : (
        <div className="progress-chart">
          <div className="chart-y-axis">
            <span>100%</span>
            <span>75%</span>
            <span>50%</span>
            <span>25%</span>
            <span>0%</span>
          </div>

          <div className="bars-container">
            {projects.map((project) => (
              <div
                className="bar-item"
                key={project.id}
              >
                <div className="bar-area">
                  <div
                    className="progress-bar"
                    style={{
                      height: `${project.progress}%`,
                    }}
                  />

                  <span
                    className="bar-value"
                    style={{
                      bottom: `calc(${project.progress}% + 8px)`,
                    }}
                  >
                    {project.progress}%
                  </span>
                </div>

                <p title={project.name}>
                  {project.name}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default ProjectProgress;