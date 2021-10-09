import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { LoginComponent } from './login/login.component';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'phone-directory';
  user;
  
  constructor(private dialog: MatDialog){
    //get user from session storage if present
    this.user = JSON.parse(sessionStorage.getItem("directoryUser"));
  }

  login(){
    this.dialog.open(LoginComponent);
  } 
  
  logout(){
    //remove user details from session storage and reload
    sessionStorage.removeItem("directoryUser");
    window.location.reload();
  }
}
