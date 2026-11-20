-- Learners who studied before enrollments existed (#174) keep their courses:
-- each is enrolled in every course they have progress in, from the day of
-- their first review there. Once `GET /api/courses` lists only enrolled
-- courses, a course with progress but no enrollment would vanish from the
-- dashboard.
INSERT INTO `enrollments` (`user_id`, `course_id`, `added_at`)
SELECT
  `p`.`user_id`,
  `c`.`course_id`,
  coalesce(
    (
      SELECT min(`r`.`reviewed_at`)
      FROM `reviews` `r`
      JOIN `cards` `rc` ON `rc`.`id` = `r`.`card_id`
      WHERE `r`.`user_id` = `p`.`user_id` AND `rc`.`course_id` = `c`.`course_id`
    ),
    min(`p`.`updated_at`)
  )
FROM `user_progress` `p`
JOIN `cards` `c` ON `c`.`id` = `p`.`card_id`
GROUP BY `p`.`user_id`, `c`.`course_id`;
