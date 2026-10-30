import { Component } from '@angular/core';
import { COURSES } from '../../data/courses';

@Component({
  selector: 'app-course-list',
  template: `<h1>Courses</h1>`,
})
export class CourseListComponent {
  readonly courses = COURSES;
}
