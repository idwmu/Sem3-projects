import tkinter as tk
from tkinter import ttk, messagebox, simpledialog
import subprocess
import threading
import sys
import os


class AirlineReservationGUI:
    def __init__(self, root):
        self.root = root
        self.root.title("Airline Reservation System")
        self.root.geometry("900x700")
        
        # Enable fullscreen toggle
        self.is_fullscreen = False
        self.root.bind("<F11>", self.toggle_fullscreen)
        self.root.bind("<Escape>", self.exit_fullscreen)
        
        # Start the C process
        self.process = subprocess.Popen(
            [r"C:\Users\manas\Sem3\DSA\miniproj\miniproj.exe"],
            stdin=subprocess.PIPE,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True,
            bufsize=1
        )
        
        self.setup_ui()
        self.start_output_listener()
    
    
    def toggle_fullscreen(self, event=None):
        """Toggle fullscreen mode"""
        self.is_fullscreen = not self.is_fullscreen
        self.root.attributes('-fullscreen', self.is_fullscreen)
        return "break"
    
    
    def exit_fullscreen(self, event=None):
        """Exit fullscreen mode"""
        if self.is_fullscreen:
            self.is_fullscreen = False
            self.root.attributes('-fullscreen', False)
        return "break"
    
    
    def setup_ui(self):
        """Setup the main UI with tabs and widgets"""
        
        # Title with fullscreen info
        title_frame = tk.Frame(self.root, bg="#2c3e50", height=60)
        title_frame.pack(fill=tk.X)
        
        title_label = tk.Label(
            title_frame, 
            text="✈ Airline Reservation System", 
            font=("Helvetica", 18, "bold"),
            bg="#2c3e50",
            fg="white"
        )
        title_label.pack(side=tk.LEFT, padx=10, pady=10)
        
        fullscreen_hint = tk.Label(
            title_frame,
            text="(Press F11 for fullscreen, ESC to exit)",
            font=("Helvetica", 9),
            bg="#2c3e50",
            fg="#ecf0f1"
        )
        fullscreen_hint.pack(side=tk.RIGHT, padx=10, pady=10)
        
        # Create notebook for tabs
        self.notebook = ttk.Notebook(self.root)
        self.notebook.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        # Tab 1: Add Flight
        self.tab_add_flight = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_add_flight, text="Add Flight")
        self.setup_add_flight_tab()
        
        # Tab 2: Book Seat
        self.tab_book_seat = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_book_seat, text="Book Seat")
        self.setup_book_seat_tab()
        
        # Tab 3: Cancel Booking
        self.tab_cancel_booking = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_cancel_booking, text="Cancel Booking")
        self.setup_cancel_booking_tab()
        
        # Tab 4: Passenger List
        self.tab_passenger_list = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_passenger_list, text="Passenger List")
        self.setup_passenger_list_tab()
        
        # Tab 5: Search Flights
        self.tab_search_flights = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_search_flights, text="Search Flights")
        self.setup_search_flights_tab()
        
        # Tab 6: Display All Flights
        self.tab_display_flights = ttk.Frame(self.notebook)
        self.notebook.add(self.tab_display_flights, text="All Flights")
        self.setup_display_flights_tab()
        
        # Output Text Widget
        output_label = tk.Label(
            self.root, 
            text="System Output:", 
            font=("Helvetica", 10, "bold"),
            justify=tk.LEFT
        )
        output_label.pack(anchor="w", padx=10, pady=(5, 0))
        
        self.output_text = tk.Text(
            self.root, 
            height=8, 
            width=100, 
            bg="#f8f9fa",
            font=("Courier", 9)
        )
        self.output_text.pack(padx=10, pady=5, fill=tk.BOTH, expand=True)
        
        # Scrollbar for output
        scrollbar = ttk.Scrollbar(self.output_text)
        scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
        self.output_text.config(yscrollcommand=scrollbar.set)
        scrollbar.config(command=self.output_text.yview)
    
    
    def setup_add_flight_tab(self):
        """Setup Add Flight tab"""
        frame = ttk.LabelFrame(self.tab_add_flight, text="Add a New Flight", padding=15)
        frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        ttk.Label(frame, text="Flight ID:", font=("Helvetica", 10)).grid(row=0, column=0, sticky="w", pady=5)
        self.flight_id_entry = ttk.Entry(frame, width=20)
        self.flight_id_entry.grid(row=0, column=1, sticky="w", pady=5)
        
        ttk.Label(frame, text="Source:", font=("Helvetica", 10)).grid(row=1, column=0, sticky="w", pady=5)
        self.source_entry = ttk.Entry(frame, width=20)
        self.source_entry.grid(row=1, column=1, sticky="w", pady=5)
        
        ttk.Label(frame, text="Destination:", font=("Helvetica", 10)).grid(row=2, column=0, sticky="w", pady=5)
        self.dest_entry = ttk.Entry(frame, width=20)
        self.dest_entry.grid(row=2, column=1, sticky="w", pady=5)
        
        ttk.Label(frame, text="Capacity:", font=("Helvetica", 10)).grid(row=3, column=0, sticky="w", pady=5)
        self.capacity_entry = ttk.Entry(frame, width=20)
        self.capacity_entry.grid(row=3, column=1, sticky="w", pady=5)
        
        ttk.Button(frame, text="Add Flight", command=self.add_flight).grid(row=4, column=0, columnspan=2, pady=15)
    
    
    def setup_book_seat_tab(self):
        """Setup Book Seat tab"""
        frame = ttk.LabelFrame(self.tab_book_seat, text="Book a Seat", padding=15)
        frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        ttk.Label(frame, text="Flight ID:", font=("Helvetica", 10)).grid(row=0, column=0, sticky="w", pady=5)
        self.book_flight_id_entry = ttk.Entry(frame, width=20)
        self.book_flight_id_entry.grid(row=0, column=1, sticky="w", pady=5)
        
        ttk.Label(frame, text="Passenger Name:", font=("Helvetica", 10)).grid(row=1, column=0, sticky="w", pady=5)
        self.book_name_entry = ttk.Entry(frame, width=20)
        self.book_name_entry.grid(row=1, column=1, sticky="w", pady=5)
        
        ttk.Button(frame, text="Book Seat", command=self.book_seat).grid(row=2, column=0, columnspan=2, pady=15)
    
    
    def setup_cancel_booking_tab(self):
        """Setup Cancel Booking tab"""
        frame = ttk.LabelFrame(self.tab_cancel_booking, text="Cancel a Booking", padding=15)
        frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        ttk.Label(frame, text="Passenger ID:", font=("Helvetica", 10)).grid(row=0, column=0, sticky="w", pady=5)
        self.cancel_passenger_id_entry = ttk.Entry(frame, width=20)
        self.cancel_passenger_id_entry.grid(row=0, column=1, sticky="w", pady=5)
        
        ttk.Button(frame, text="Cancel Booking", command=self.cancel_booking).grid(row=1, column=0, columnspan=2, pady=15)
    
    
    def setup_passenger_list_tab(self):
        """Setup Passenger List tab"""
        frame = ttk.LabelFrame(self.tab_passenger_list, text="View Passenger List", padding=15)
        frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        ttk.Label(frame, text="Flight ID:", font=("Helvetica", 10)).grid(row=0, column=0, sticky="w", pady=5)
        self.plist_flight_id_entry = ttk.Entry(frame, width=20)
        self.plist_flight_id_entry.grid(row=0, column=1, sticky="w", pady=5)
        
        ttk.Button(frame, text="Display Passengers", command=self.display_passenger_list).grid(row=1, column=0, columnspan=2, pady=15)
    
    
    def setup_search_flights_tab(self):
        """Setup Search Flights tab"""
        frame = ttk.LabelFrame(self.tab_search_flights, text="Search Flights", padding=15)
        frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        ttk.Label(frame, text="Source:", font=("Helvetica", 10)).grid(row=0, column=0, sticky="w", pady=5)
        self.search_source_entry = ttk.Entry(frame, width=20)
        self.search_source_entry.grid(row=0, column=1, sticky="w", pady=5)
        
        ttk.Label(frame, text="Destination:", font=("Helvetica", 10)).grid(row=1, column=0, sticky="w", pady=5)
        self.search_dest_entry = ttk.Entry(frame, width=20)
        self.search_dest_entry.grid(row=1, column=1, sticky="w", pady=5)
        
        ttk.Button(frame, text="Search", command=self.search_flights).grid(row=2, column=0, columnspan=2, pady=15)
    
    
    def setup_display_flights_tab(self):
        """Setup Display All Flights tab"""
        frame = ttk.LabelFrame(self.tab_display_flights, text="All Available Flights", padding=15)
        frame.pack(fill=tk.BOTH, expand=True, padx=10, pady=10)
        
        ttk.Button(frame, text="Refresh Flight List", command=self.display_all_flights).pack(pady=15)
    
    
    def send_command(self, command):
        """Send command to C process"""
        try:
            self.process.stdin.write(command + "\n")
            self.process.stdin.flush()
        except (BrokenPipeError, OSError) as e:
            messagebox.showerror("Error", f"Failed to communicate with backend: {e}")
    
    
    def add_flight(self):
        """Add a new flight"""
        try:
            flight_id = int(self.flight_id_entry.get())
            source = self.source_entry.get().strip()
            destination = self.dest_entry.get().strip()
            capacity = int(self.capacity_entry.get())
            
            if not source or not destination:
                messagebox.showwarning("Input Error", "Source and Destination cannot be empty!")
                return
            
            command = f"ADD_FLIGHT\n{flight_id} {source} {destination} {capacity}"
            self.send_command(command)
            
            self.flight_id_entry.delete(0, tk.END)
            self.source_entry.delete(0, tk.END)
            self.dest_entry.delete(0, tk.END)
            self.capacity_entry.delete(0, tk.END)
            
            messagebox.showinfo("Success", "Flight added successfully!")
        except ValueError:
            messagebox.showerror("Input Error", "Please enter valid numeric values!")
    
    
    def book_seat(self):
        """Book a seat"""
        try:
            flight_id = int(self.book_flight_id_entry.get())
            name = self.book_name_entry.get().strip()
            
            if not name:
                messagebox.showwarning("Input Error", "Passenger name cannot be empty!")
                return
            
            command = f"BOOK_SEAT\n{flight_id} {name}"
            self.send_command(command)
            
            self.book_flight_id_entry.delete(0, tk.END)
            self.book_name_entry.delete(0, tk.END)
            
            messagebox.showinfo("Success", "Booking processed!")
        except ValueError:
            messagebox.showerror("Input Error", "Please enter a valid Flight ID!")
    
    
    def cancel_booking(self):
        """Cancel a booking"""
        try:
            passenger_id = int(self.cancel_passenger_id_entry.get())
            
            command = f"CANCEL_BOOKING\n{passenger_id}"
            self.send_command(command)
            
            self.cancel_passenger_id_entry.delete(0, tk.END)
            
            messagebox.showinfo("Success", "Cancellation processed!")
        except ValueError:
            messagebox.showerror("Input Error", "Please enter a valid Passenger ID!")
    
    
    def display_passenger_list(self):
        """Display passenger list for a flight"""
        try:
            flight_id = int(self.plist_flight_id_entry.get())
            
            command = f"DISPLAY_PASSENGERS\n{flight_id}"
            self.send_command(command)
        except ValueError:
            messagebox.showerror("Input Error", "Please enter a valid Flight ID!")
    
    
    def search_flights(self):
        """Search flights by source and destination"""
        source = self.search_source_entry.get().strip()
        destination = self.search_dest_entry.get().strip()
        
        if not source or not destination:
            messagebox.showwarning("Input Error", "Source and Destination cannot be empty!")
            return
        
        command = f"SEARCH_FLIGHTS\n{source} {destination}"
        self.send_command(command)
    
    
    def display_all_flights(self):
        """Display all flights"""
        command = "DISPLAY_ALL_FLIGHTS"
        self.send_command(command)
    
    
    def start_output_listener(self):
        """Listen to C process output in a separate thread"""
        thread = threading.Thread(target=self.read_output, daemon=True)
        thread.start()
    
    
    def read_output(self):
        """Read output from C process"""
        try:
            while True:
                line = self.process.stdout.readline()
                if line:
                    self.output_text.config(state=tk.NORMAL)
                    self.output_text.insert(tk.END, line)
                    self.output_text.see(tk.END)
                    self.output_text.config(state=tk.NORMAL)
                else:
                    break
        except Exception as e:
            self.output_text.config(state=tk.NORMAL)
            self.output_text.insert(tk.END, f"Error reading output: {e}\n")
    
    
    def on_closing(self):
        """Close the application and terminate C process"""
        try:
            self.send_command("EXIT")
            self.process.terminate()
            self.process.wait(timeout=2)
        except:
            self.process.kill()
        
        self.root.destroy()


if __name__ == "__main__":
    root = tk.Tk()
    gui = AirlineReservationGUI(root)
    root.protocol("WM_DELETE_WINDOW", gui.on_closing)
    root.mainloop()
