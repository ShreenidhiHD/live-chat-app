<?php

namespace App\Http\Controllers;
use App\Models\User;
use App\Models\Company;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Support\Facades\Log;

class UserController extends Controller
{
    // public function register(Request $request)
    // {
    //     $request->validate([
    //         'name' => 'required',
    //         'email' => 'required|email|unique:users',
    //         'password' => 'required|required'
    //     ]);
    
    //     $user = User::create([
    //         'name' => $request->name,
    //         'email' => $request->email,
    //         'password' => Hash::make($request->password),
    //         'role' => $request->role ?? 'customer',
    //     ]);
    
    //     $token = $user->createToken('apptoken')->plainTextToken;
    
    //     return response()->json(['token' => $token, 'user' => $user], 201);
    // }
    
    public function changePassword(Request $request)
    {
        try {
            // Validate the request data
            $request->validate([
                'current_password' => 'required',
                'new_password' => 'required|min:8',
            ]);

            $user = $request->user();  // Retrieve the authenticated user

            // Verify the current password
            if (!Hash::check($request->current_password, $user->password)) {
                return response()->json(['message' => 'Current password is incorrect.'], 401);
            }

            // Update the password
            $user->password = Hash::make($request->new_password);
            $user->save();

            return response()->json(['message' => 'Password updated successfully.'], 200);
        } catch (QueryException $e) {
            return response()->json(['message' => $e->getMessage()], 400);
        } catch (PDOException $e) {
            // Log the database connection error
            Log::error('Database connection error:', $e->getMessage());

            return response()->json(['message' => 'Database connection failed. Please try again later.'], 503);
        } catch (ValidationException $e) {
            // Log the validation error
            Log::error('Validation error:', $e->errors());

            return response()->json(['message' => $e->errors()], 422);
        } catch (\Exception $e) {
            // Log the exception
            Log::error('Exception:', $e->getMessage());

            return response()->json(['message' => 'Password change failed. Please try again.'], 500);
        }
    }
    public function register(Request $request)
{
    // Validate the incoming request data
    $request->validate([
        'name' => 'required',
        'email' => 'required|email|unique:users',
        'password' => 'required|required',
    ]);

    // Create a new user with the provided data
    $user = User::create([
        'name' => $request->name,
        'email' => $request->email,
        'password' => Hash::make($request->password),
        'role' => $request->role ?? 'agent', // Assign role if provided, otherwise default to 'agent'
        'company_id' => $request->user()->company_id, // Assign the company_id from the authenticated user
    ]);

    
    return response()->json(['user' => $user], 201);
}

    

    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);
    
        $user = User::where('email', $request->email)->first();
    
        if (!$user || !Hash::check($request->password, $user->password)) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }
    
        $token = $user->createToken('apptoken')->plainTextToken;
    
        return response()->json(['token' => $token, 'user' => $user]);
    }

    public function userprofile(Request $request)
    {

       $user = $request->user();

        if ($user) {
            $userId = $user->id;
            $userName = $user->name;
        
            return [
                'id' => $userId,
                'name' => $userName,
            ];
        }   
    }
    public function userrole(Request $request){
        $user = $request->user();

        if (!$user) {
            return response()->json(['message' => 'Invalid token'], 401);
        }

        $role=$user->role;

        return response()->json(['message' => $role], 200);
    }
 
    

public function registerUserWithCompany(Request $request)
{
    $request->validate([
        'user_name' => 'required|string',
        'user_email' => 'required|email|unique:users,email',
        'user_password' => 'required|string',
        'company_name' => 'required|string',
        'website_url' => 'required|url',
    ]);

    try {
        DB::beginTransaction();

        $user = User::create([
            'name' => $request->input('user_name'),
            'email' => $request->input('user_email'),
            'password' => Hash::make($request->input('user_password')),
            'role' => 'website_owner',
        ]);

        $company = Company::create([
            'name' => $request->input('company_name'),
            'website_url' => $request->input('website_url'),
            'website_owner_id' => $user->id,
        ]);

        $user->update(['company_id' => $company->id]);

        DB::commit();

        return response()->json(['message' => 'User and Company registered successfully']);
    } catch (\Exception $e) {
        DB::rollback();

        return response()->json(['message' => 'An error occurred. Registration process failed.'], 500);
    }
}

public function agentslist(Request $request)
{
    $user = $request->user();

    if (!$user) {
        return response()->json(['message' => 'User not authenticated'], 401);
    }

    // Fetch the company ID from the requested user
    $company_id = $user->company_id;

    // Fetch all users with the same company ID and select only the necessary fields
    $users = DB::table('users')
        ->where('company_id', $company_id)
        ->where('role', 'agent') // Assuming agents are the users with 'agent' role
        ->select('name', 'email', 'role')
        ->get();

    // Structure the data as needed for the frontend
    $columns = [
        ['field' => 'name', 'headerName' => 'Name'],
        ['field' => 'email', 'headerName' => 'E-Mail'],
        ['field' => 'role', 'headerName' => 'Role'],
    ];

    $rows = $users->map(function ($user) {
        return [
            'name' => ucfirst($user->name),
            'email' => $user->email,
            'role' => ucfirst($user->role),
        ];
    });

    return response()->json([
        'columns' => $columns,
        'rows' => $rows
    ]);
}

}
