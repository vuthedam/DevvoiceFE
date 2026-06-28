import { useCallback, useEffect, useState } from "react";
import * as commentApi from "../api/commentApi.js";
import { getApiErrorMessage } from "../../../utils/apiError.js";

export const useComments = (postId) => {
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchComments = useCallback(async () => {
    if (!postId) return;
    setLoading(true);
    setError(null);
    try {
      const response = await commentApi.getComments({
        postId,
        status: "active",
      });
      setComments(response.data || []);
    } catch (err) {
      setError(getApiErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [postId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  return { comments, loading, error, refetch: fetchComments, setComments };
};
