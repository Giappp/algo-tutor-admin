import {del, get, post, put} from "@/api/core/http";
import {Topic} from "@/types/learning-path";
import {TopicRequestDTO} from "@/types/learning-path/schema";

export const topicService = {
    listByLearningPath: (pathId: number) =>
        get<Topic[]>(`/api/v1/topics/learning-paths/${pathId}`),

    getById: (topicId: number) =>
        get<Topic>(`/api/v1/topics/${topicId}`),

    create: (pathId: number, data: TopicRequestDTO) =>
        post<Topic>(`/api/v1/topics/learning-paths/${pathId}`, data),

    update: (topicId: number, data: TopicRequestDTO) =>
        put<Topic>(`/api/v1/topics/${topicId}`, data),

    delete: (topicId: number) =>
        del<void>(`/api/v1/topics/${topicId}`),
};
