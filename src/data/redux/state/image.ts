export const ActionsImageType = {
  // banner图
  FETCH_BANNER: 'FETCH_BANNER',
  FETCH_BANNER_SUCCESS: 'FETCH_BANNER_SUCCESS',
  FETCH_BANNER_ERROR: 'FETCH_BANNER_ERROR',
};

export interface InImageState {
  // 轮播图
  banner: {
    isLoading?: boolean;
    error?: boolean;
    data: {
      source: string;
      link?: string;
    }[];
  }
}

export const InitImageState: InImageState = {
  banner: {
    isLoading: false,
    error: false,
    data: [],
  },
};
