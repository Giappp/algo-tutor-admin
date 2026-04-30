import {get, post, put, del, getPage} from "@/api/core/http";
import {Topic, CreateTopicRequest, UpdateTopicRequest} from "@/types/learning-path";
import {PaginatedResponse} from "@/api/core/http";

export const topicService = {
    listByLearningPath: (pathId: number): Promise<PaginatedResponse<Topic>> =>
        getPage<Topic>(`/api/v1/topics/learning-paths/${pathId}`),

    getById: (topicId: number) =>
        get<Topic>(`/api/v1/topics/${topicId}`),

    create: (pathId: number, data: CreateTopicRequest) =>
        post<Topic>(`/api/v1/topics/learning-paths/${pathId}`, data),

    update: (topicId: number, data: UpdateTopicRequest) =>
        put<Topic>(`/api/v1/topics/${topicId}`, data),

    delete: (topicId: number) =>
        del<void>(`/api/v1/topics/${topicId}`),
};
