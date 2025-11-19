#include <stdio.h>
#include <stdlib.h>
#include <string.h>
#include <ctype.h>

#define MAX_PASSENGERS 100
#define HASH_SIZE 50
#define MAX_NAME 50
#define MAX_LOCATION 50

typedef struct Passenger {
    int passengerId;
    char name[MAX_NAME];
    int flightId;
    struct Passenger* next;
} Passenger;

typedef struct Flight {
    int flightId;
    char source[MAX_LOCATION];
    char destination[MAX_LOCATION];
    int capacity;
    int bookedSeats;
    int passengerIds[MAX_PASSENGERS];
    struct Flight* left;
    struct Flight* right;
} Flight;

typedef struct {
    Passenger* table[HASH_SIZE];
} PassengerHashMap;

Flight* flightRoot = NULL;
PassengerHashMap passengerMap;
int nextPassengerId = 1;

int hashFunction(int passengerId);
void initHashMap();
Flight* createFlight(int id, char* src, char* dest, int cap);
Flight* insertFlight(Flight* root, Flight* newFlight);
Flight* searchFlight(Flight* root, int flightId);
void inorderTraversal(Flight* root);
void addPassengerToHash(Passenger* p);
Passenger* searchPassengerInHash(int passengerId);
int removePassengerFromHash(int passengerId);
void addNewFlight(int id, char* src, char* dest, int cap);
int bookSeat(int flightId, char* name);
int cancelBooking(int passengerId);
void displayPassengerList(int flightId);
void searchFlights(char* searchSrc, char* searchDest);
void displayAllFlights();
void toLowerCase(char* str);
void searchHelper(Flight* root, char* searchSrc, char* searchDest);

int hashFunction(int passengerId) {
    return passengerId % HASH_SIZE;
}

void initHashMap() {
    for (int i = 0; i < HASH_SIZE; i++) {
        passengerMap.table[i] = NULL;
    }
}

Flight* createFlight(int id, char* src, char* dest, int cap) {
    Flight* newFlight = (Flight*)malloc(sizeof(Flight));
    newFlight->flightId = id;
    strcpy(newFlight->source, src);
    strcpy(newFlight->destination, dest);
    newFlight->capacity = cap;
    newFlight->bookedSeats = 0;
    newFlight->left = NULL;
    newFlight->right = NULL;
    return newFlight;
}

Flight* insertFlight(Flight* root, Flight* newFlight) {
    if (root == NULL) {
        return newFlight;
    }
    
    if (newFlight->flightId < root->flightId) {
        root->left = insertFlight(root->left, newFlight);
    } else if (newFlight->flightId > root->flightId) {
        root->right = insertFlight(root->right, newFlight);
    } else {
        printf("ERROR: Flight ID %d already exists!\n", newFlight->flightId);
        free(newFlight);
    }
    
    return root;
}

Flight* searchFlight(Flight* root, int flightId) {
    if (root == NULL || root->flightId == flightId) {
        return root;
    }
    
    if (flightId < root->flightId) {
        return searchFlight(root->left, flightId);
    }
    
    return searchFlight(root->right, flightId);
}

void inorderTraversal(Flight* root) {
    if (root != NULL) {
        inorderTraversal(root->left);
        printf("FLIGHT|%d|%s|%s|%d|%d\n",
               root->flightId, root->source, root->destination,
               root->bookedSeats, root->capacity);
        inorderTraversal(root->right);
    }
}

void addPassengerToHash(Passenger* p) {
    int index = hashFunction(p->passengerId);
    p->next = passengerMap.table[index];
    passengerMap.table[index] = p;
}

Passenger* searchPassengerInHash(int passengerId) {
    int index = hashFunction(passengerId);
    Passenger* current = passengerMap.table[index];
    
    while (current != NULL) {
        if (current->passengerId == passengerId) {
            return current;
        }
        current = current->next;
    }
    
    return NULL;
}

int removePassengerFromHash(int passengerId) {
    int index = hashFunction(passengerId);
    Passenger* current = passengerMap.table[index];
    Passenger* prev = NULL;
    
    while (current != NULL) {
        if (current->passengerId == passengerId) {
            if (prev == NULL) {
                passengerMap.table[index] = current->next;
            } else {
                prev->next = current->next;
            }
            free(current);
            return 1;
        }
        prev = current;
        current = current->next;
    }
    
    return 0;
}

void toLowerCase(char* str) {
    for (int i = 0; str[i]; i++) {
        str[i] = tolower(str[i]);
    }
}

void addNewFlight(int id, char* src, char* dest, int cap) {
    Flight* newFlight = createFlight(id, src, dest, cap);
    flightRoot = insertFlight(flightRoot, newFlight);
    printf("SUCCESS: Flight added successfully!\n");
}

int bookSeat(int flightId, char* name) {
    Flight* flight = searchFlight(flightRoot, flightId);
    
    if (flight == NULL) {
        printf("ERROR: Flight not found!\n");
        return -1;
    }
    
    if (flight->bookedSeats >= flight->capacity) {
        printf("ERROR: Flight is full! No seats available.\n");
        return -1;
    }
    
    Passenger* newPassenger = (Passenger*)malloc(sizeof(Passenger));
    newPassenger->passengerId = nextPassengerId++;
    strcpy(newPassenger->name, name);
    newPassenger->flightId = flightId;
    newPassenger->next = NULL;
    
    addPassengerToHash(newPassenger);
    
    flight->passengerIds[flight->bookedSeats] = newPassenger->passengerId;
    flight->bookedSeats++;
    
    printf("SUCCESS: Booking successful! Passenger ID: %d\n", newPassenger->passengerId);
    return newPassenger->passengerId;
}

int cancelBooking(int passengerId) {
    Passenger* passenger = searchPassengerInHash(passengerId);
    
    if (passenger == NULL) {
        printf("ERROR: Passenger not found!\n");
        return 0;
    }
    
    int flightId = passenger->flightId;
    Flight* flight = searchFlight(flightRoot, flightId);
    
    if (flight == NULL) {
        printf("ERROR: Associated flight not found!\n");
        return 0;
    }
    
    int found = 0;
    for (int i = 0; i < flight->bookedSeats; i++) {
        if (flight->passengerIds[i] == passengerId) {
            for (int j = i; j < flight->bookedSeats - 1; j++) {
                flight->passengerIds[j] = flight->passengerIds[j + 1];
            }
            flight->bookedSeats--;
            found = 1;
            break;
        }
    }
    
    removePassengerFromHash(passengerId);
    
    printf("SUCCESS: Booking cancelled successfully!\n");
    return 1;
}

void displayPassengerList(int flightId) {
    Flight* flight = searchFlight(flightRoot, flightId);
    
    if (flight == NULL) {
        printf("ERROR: Flight not found!\n");
        return;
    }
    
    printf("FLIGHT_INFO|%d|%s|%s|%d|%d\n", 
           flight->flightId, flight->source, flight->destination,
           flight->bookedSeats, flight->capacity);
    
    for (int i = 0; i < flight->bookedSeats; i++) {
        Passenger* p = searchPassengerInHash(flight->passengerIds[i]);
        if (p != NULL) {
            printf("PASSENGER|%d|%s\n", p->passengerId, p->name);
        }
    }
    printf("END_PASSENGER_LIST\n");
}

void searchHelper(Flight* root, char* searchSrc, char* searchDest) {
    if (root != NULL) {
        searchHelper(root->left, searchSrc, searchDest);
        
        char flightSrc[MAX_LOCATION], flightDest[MAX_LOCATION];
        strcpy(flightSrc, root->source);
        strcpy(flightDest, root->destination);
        toLowerCase(flightSrc);
        toLowerCase(flightDest);
        
        if (strcmp(flightSrc, searchSrc) == 0 && strcmp(flightDest, searchDest) == 0) {
            printf("FLIGHT|%d|%s|%s|%d|%d\n",
                   root->flightId, root->source, root->destination,
                   root->bookedSeats, root->capacity);
        }
        
        searchHelper(root->right, searchSrc, searchDest);
    }
}

void searchFlights(char* searchSrc, char* searchDest) {
    char src[MAX_LOCATION], dest[MAX_LOCATION];
    strcpy(src, searchSrc);
    strcpy(dest, searchDest);
    toLowerCase(src);
    toLowerCase(dest);
    
    searchHelper(flightRoot, src, dest);
    printf("END_SEARCH_RESULTS\n");
}

void displayAllFlights() {
    if (flightRoot == NULL) {
        printf("NO_FLIGHTS\n");
        return;
    }
    inorderTraversal(flightRoot);
    printf("END_FLIGHTS\n");
}

int main() {
    char command[50], arg1[100], arg2[100], arg3[100];
    int intArg1, intArg2, intArg3;
    
    initHashMap();
    
    while (fgets(command, sizeof(command), stdin) != NULL) {
        command[strcspn(command, "\n")] = 0;
        
        if (strcmp(command, "ADD_FLIGHT") == 0) {
            scanf("%d %99s %99s %d", &intArg1, arg1, arg2, &intArg2);
            getchar();
            addNewFlight(intArg1, arg1, arg2, intArg2);
        } 
        else if (strcmp(command, "BOOK_SEAT") == 0) {
            scanf("%d %99[^\n]", &intArg1, arg1);
            getchar();
            bookSeat(intArg1, arg1);
        } 
        else if (strcmp(command, "CANCEL_BOOKING") == 0) {
            scanf("%d", &intArg1);
            getchar();
            cancelBooking(intArg1);
        } 
        else if (strcmp(command, "DISPLAY_PASSENGERS") == 0) {
            scanf("%d", &intArg1);
            getchar();
            displayPassengerList(intArg1);
        } 
        else if (strcmp(command, "SEARCH_FLIGHTS") == 0) {
            scanf("%99s %99s", arg1, arg2);
            getchar();
            searchFlights(arg1, arg2);
        } 
        else if (strcmp(command, "DISPLAY_ALL_FLIGHTS") == 0) {
            displayAllFlights();
        } 
        else if (strcmp(command, "EXIT") == 0) {
            break;
        }
        
        fflush(stdout);
    }
    
    return 0;
}
