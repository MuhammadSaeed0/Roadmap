import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { COURSES } from '../../data/courses';

@Component({
  selector: 'app-course-list',
  imports: [RouterLink],
  template: `
    <h1>Courses</h1>
    <ul>
      @for (c of courses; track c.id) { <li><a [routerLink]="['/courses', c.id]">{{ c.title }}</a></li> }
    </ul>
  `,
})
export class CourseListComponent {
  readonly courses = COURSES;
}
