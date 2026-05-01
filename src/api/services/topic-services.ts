import {del, get, post, put} from "@/api/core/http";
import {CreateTopicRequest, Topic, UpdateTopicRequest} from "@/types/learning-path";

export const topicService = {
    listByLearningPath: (pathId: number): Promise<Topic[]> =>
        get<Topic[]>(`/api/v1/topics/learning-paths/${pathId}`),

    getById: (topicId: number) =>
        get<Topic>(`/api/v1/topics/${topicId}`),

    create: (pathId: number, data: CreateTopicRequest) =>
        post<Topic>(`/api/v1/topics/learning-paths/${pathId}`, data),

    update: (topicId: number, data: UpdateTopicRequest) =>
        put<Topic>(`/api/v1/topics/${topicId}`, data),

    delete: (topicId: number) =>
        del<void>(`/api/v1/topics/${topicId}`),
};
