import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { Project } from '../types'
import { projectService } from '../services/project-service'

export const useProjectStore = defineStore('project', () => {
  const projects = ref<Project[]>([])
  const currentProjectId = ref<string | null>(localStorage.getItem('currentProjectId'))
  const isLoading = ref(false)

  const currentProject = computed(() =>
    projects.value.find(p => p.id === currentProjectId.value) ?? null
  )

  async function fetchProjects() {
    isLoading.value = true
    try {
      projects.value = await projectService.getAll()
      if (!currentProjectId.value && projects.value.length > 0) {
        setCurrentProject(projects.value[0]!.id)
      }
    } finally {
      isLoading.value = false
    }
  }

  function setCurrentProject(id: string) {
    currentProjectId.value = id
    localStorage.setItem('currentProjectId', id)
  }

  async function createProject(name: string) {
    const project = await projectService.create(name)
    projects.value.push(project)
    return project
  }

  return { projects, currentProjectId, currentProject, isLoading, fetchProjects, setCurrentProject, createProject }
})
