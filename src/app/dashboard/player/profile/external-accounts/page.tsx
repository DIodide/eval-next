'use client'

import { useState, useEffect } from 'react'
import { useUser, useReverification } from '@clerk/nextjs'
import type { CreateExternalAccountParams, ExternalAccountResource, OAuthStrategy } from '@clerk/types'
import { useRouter } from 'next/navigation'
import type { ValorantMetadata } from '@/types/valorant'
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { 
  ShieldIcon, 
  PlusIcon, 
  XIcon, 
  CheckIcon, 
  AlertTriangleIcon,
  LoaderIcon,
  ArrowLeftIcon,
  ExternalLinkIcon
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"

// Capitalize the first letter of the provider name
// E.g. 'discord' -> 'Discord'
const capitalize = (provider: string) => {
  return `${provider.slice(0, 1).toUpperCase()}${provider.slice(1)}`
}

// Remove the 'oauth' prefix from the strategy string
// E.g. 'oauth_custom_valorant' -> 'custom_valorant'
// Used to match the strategy with the 'provider' field in externalAccounts
const normalizeProvider = (provider: string) => {
  return provider.replace('oauth_', '')
}

// Get display name for provider
const getProviderDisplayName = (provider: string) => {
  if (provider === 'custom_valorant' || provider === 'valorant') {
    return 'VALORANT (Riot Games)'
  }
  if (provider === 'discord') {
    return 'Discord'
  }
  return capitalize(provider)
}

// Get provider icon - returns either a Lucide icon component or special string for custom handling
const getProviderIcon = (provider: string) => {
  if (provider === 'custom_valorant' || provider === 'valorant') {
    return 'valorant-logo'
  }
  if (provider === 'discord') {
    return 'discord-logo'
  }
  return ShieldIcon // Default icon
}

// Get provider color
const getProviderColor = (provider: string) => {
  if (provider === 'custom_valorant' || provider === 'valorant') {
    return 'bg-red-600'
  }
  if (provider === 'discord') {
    return 'bg-indigo-600'
  }
  return 'bg-gray-600'
}

export default function ManageExternalAccounts() {
  const router = useRouter()
  // Use Clerk's `useUser()` hook to get the current user's `User` object
  const { isLoaded, user } = useUser()
  
  // Add loading state for OAuth connection
  const [isConnecting, setIsConnecting] = useState(false)
  const [isUserReady, setIsUserReady] = useState(false)
  const [isProcessingValorant, setIsProcessingValorant] = useState(false)
  
  // Preload and warm up the user session
  useEffect(() => {
    const initializeUser = async () => {
      if (!isLoaded || !user) {
        setIsUserReady(false)
        return
      }
      
      // Wait a moment for all user methods to be fully available
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Verify the createExternalAccount method is available and functional
      if (user.createExternalAccount && typeof user.createExternalAccount === 'function') {
        console.log('User session fully initialized')
        setIsUserReady(true)
      } else {
        console.log('User createExternalAccount method not yet available')
        setIsUserReady(false)
      }
    }
    
    void initializeUser()
  }, [isLoaded, user])
  
  // Handle OAuth callback and process Valorant data
  useEffect(() => {
    const handleOAuthCallback = async () => {
      console.debug("DEBUG 0: handleOAuthCallback");
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('callback') === 'true' && isUserReady && user) {
        // Check if we just connected a Valorant account
        await user.reload(); // Refresh user data
        
        const valorantAccount = user.externalAccounts?.find(
          account => account.provider === 'custom_valorant' && 
                    account.verification?.status === 'verified'
        );
        
        if (valorantAccount) {
          // Process the Valorant OAuth to get PUUID
          await processValorantOAuth();
        }
        
        // Clean up URL
        router.replace('/dashboard/player/profile/external-accounts');
        setIsConnecting(false);
      }
    };

    void handleOAuthCallback();
  }, [isUserReady, user, router]);
  
  // Create reverification functions only when user is ready
  const createExternalAccount = useReverification((params: CreateExternalAccountParams) => {
    if (!user?.createExternalAccount) {
      throw new Error('User not fully loaded or createExternalAccount method not available')
    }
    return user.createExternalAccount(params)
  })
  
  // Enhanced account removal with Valorant cleanup
  const removeAccountWithCleanup = useReverification(async (account: ExternalAccountResource) => {
    try {
      const isValorantAccount = account.provider === 'custom_valorant';
      
      // Remove the external account
      await account.destroy();
      
      // If it was a Valorant account, clean up metadata immediately
      if (isValorantAccount) {
        try {
          const response = await fetch('/api/valorant/cleanup-metadata', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
          });
          
          if (response.ok) {
            const data = await response.json() as { success?: boolean; cleaned?: boolean; message?: string };
            if (data.success && data.cleaned) {
              console.log('✅ Valorant metadata cleaned up successfully');
            } else {
              console.log('ℹ️ No cleanup needed:', data.message);
            }
          } else {
            console.warn('⚠️ Failed to clean up metadata immediately - webhook will handle it');
          }
        } catch (cleanupError) {
          console.warn('⚠️ Cleanup request failed - webhook will handle it:', cleanupError);
        }
        
        // Refresh user data to reflect changes
        await user?.reload();
      }
    } catch (error) {
      console.error('❌ Error removing external account:', error);
      throw error; // Re-throw so reverification can handle it
    }
  });

  // Legacy function for backwards compatibility
  const accountDestroy = removeAccountWithCleanup;

  // List the options the user can select when adding a new external account
  // Supporting Valorant and Discord OAuth
  const options: OAuthStrategy[] = ['oauth_custom_valorant', 'oauth_discord']

  // Process Valorant OAuth to fetch PUUID
  const processValorantOAuth = async () => {
    try {
      setIsProcessingValorant(true)
      const response = await fetch('/api/riot/process-oauth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json() as { 
        success?: boolean; 
        gameName?: string; 
        tagLine?: string; 
        error?: string; 
      };
      
      if (data.success) {
        // Show success notification
        console.log(`Successfully connected VALORANT account: ${data.gameName}#${data.tagLine}`)
        // Refresh user data to show updated metadata
        await user?.reload();
      } else {
        console.error('Failed to process Valorant OAuth:', data.error);
        alert('Failed to fetch VALORANT account data. Please try reconnecting.');
      }
    } catch (error) {
      console.error('Error processing Valorant OAuth:', error);
      alert('An error occurred while processing your VALORANT connection.');
    } finally {
      setIsProcessingValorant(false)
    }
  };

    // Handle adding the new external account
  const addSSO = async (strategy: OAuthStrategy) => {
    console.log(`Attempting to create external account with strategy: ${strategy}`)
    
    // Guard clause: Ensure user session is fully ready
    if (!isUserReady) {
      console.error('User session not fully initialized yet')
      alert('Please wait for the user session to fully initialize before connecting an account.')
      return
    }
    
    setIsConnecting(true)
    
          try {
      // Alternative approach: Use user object directly if reverification fails
      let res
      try {
        res = await createExternalAccount({
          strategy,
          redirectUrl: '/dashboard/player/profile/external-accounts?callback=true',
        })
      } catch (reverificationError) {
        console.log('Reverification approach failed, trying direct user method:', reverificationError)
        // Fallback: Use user object directly
        res = await user!.createExternalAccount({
          strategy,
          redirectUrl: '/dashboard/player/profile/external-accounts?callback=true',
        })
      }
      
      console.log('CreateExternalAccount response:', res)
      
      if (res?.verification?.externalVerificationRedirectURL) {
        console.log('Redirecting to:', res.verification.externalVerificationRedirectURL.href)
        router.push(res.verification.externalVerificationRedirectURL.href)
      } else {
        console.error('No redirect URL found in response')
        console.log('Verification object:', res?.verification)
        alert('OAuth redirect URL not found. Please check if the OAuth provider is properly configured in Clerk.')
        setIsConnecting(false)
      }
    } catch (err) {
      console.error('Error creating external account:', err)
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      
      // Special handling for the "User not fully loaded" error
      if (errorMessage.includes('User not fully loaded')) {
        alert('Please wait a moment and try again. The user session is still initializing.')
      } else {
        alert(`Failed to connect account: ${errorMessage}`)
      }
      setIsConnecting(false)
    }
  }

  // Show a loading message until Clerk loads
  if (!isLoaded) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <LoaderIcon className="h-8 w-8 animate-spin text-blue-400" />
          <span className="ml-3 text-gray-400">Loading account information...</span>
        </div>
      </div>
    )
  }

  // Find the external accounts from the options array that the user has not yet added to their account
  // This prevents showing an 'add' button for existing external account types
  const unconnectedOptions = options.filter(
    (option) =>
      !user?.externalAccounts.some((account) => account.provider === normalizeProvider(option)),
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-orbitron font-bold text-white">
          External Accounts
        </h1>
        <p className="text-gray-400 mt-2 font-rajdhani">
          Connect your gaming accounts for enhanced profile features
        </p>
      </div>

      {/* Connected Accounts */}
      <Card className="bg-gray-900 border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2 font-orbitron">
          <CheckIcon className="h-5 w-5 text-green-400" />
          Connected Accounts
        </h2>
        
        {user?.externalAccounts && user.externalAccounts.length > 0 ? (
          <div className="space-y-4">
            {user.externalAccounts.map((account) => {
              const Icon = getProviderIcon(account.provider)
              const providerColor = getProviderColor(account.provider)
              const displayName = getProviderDisplayName(account.provider)
              
              // Get Valorant metadata if available
              const valorantData = account.provider === 'custom_valorant' ? 
                user.publicMetadata?.valorant : null;
              
                             return (
                 <div key={account.id} className="flex items-center justify-between p-4 bg-gray-800 rounded-lg">
                   <div className="flex items-center gap-3">
                     {Icon === 'valorant-logo' ? (
                       <div className="w-10 h-10 flex items-center justify-center">
                         <Image 
                           src="/valorant/logos/Valorant Logo Red Border.jpg"
                           alt="VALORANT Logo"
                           width={32}
                           height={32}
                           className="object-contain"
                         />
                       </div>
                     ) : Icon === 'discord-logo' ? (
                       <div className="w-10 h-10 flex items-center justify-center">
                         <Image 
                           src="/discord/Discord-Symbol-White.svg"
                           alt="Discord Logo"
                           width={32}
                           height={32}
                           className="object-contain"
                         />
                       </div>
                     ) : (
                       <div className={`p-2 rounded ${providerColor}`}>
                         <Icon className="h-5 w-5 text-white" />
                       </div>
                     )}
                    <div>
                      <p className="text-white font-medium font-orbitron">{displayName}</p>
                      
                      {/* Show Valorant game name if available */}
                      {account.provider === 'custom_valorant' && valorantData && 'gameName' in valorantData && (
                        <p className="text-cyan-400 text-sm font-rajdhani">
                          {valorantData.gameName}#{valorantData.tagLine}
                        </p>
                      )}
                      
                      <div className="flex items-center gap-2 mt-1">
                        <p className="text-gray-400 text-sm font-rajdhani">
                          Scopes: {account.approvedScopes}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 mt-1">
                        {account.verification?.status === 'verified' ? (
                          <div className="flex items-center gap-2">
                            <Badge className="bg-green-600 text-white text-xs">
                              <CheckIcon className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                            {account.provider === 'custom_valorant' && valorantData && 'puuid' in valorantData && (
                              <Badge className="bg-blue-600 text-white text-xs">
                                <ShieldIcon className="h-3 w-3 mr-1" />
                                PUUID Linked
                              </Badge>
                            )}
                          </div>
                        ) : (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangleIcon className="h-3 w-3 mr-1" />
                                                           {account.verification?.error?.longMessage ?? 'Verification Required'}
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {account.verification?.status !== 'verified' &&
                      account.verification?.externalVerificationRedirectURL && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-yellow-600 text-yellow-400 hover:bg-yellow-900/20 font-orbitron"
                          onClick={() => {
                            if (account.verification?.externalVerificationRedirectURL) {
                              window.location.href = account.verification.externalVerificationRedirectURL.href
                            }
                          }}
                        >
                          <ExternalLinkIcon className="h-4 w-4 mr-2" />
                          Reverify
                        </Button>
                      )}
                    {account.provider !== 'google' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gray-400 hover:text-red-400 font-orbitron"
                        onClick={() => accountDestroy(account)}
                      >
                        <XIcon className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-gray-800 rounded-full">
                <ShieldIcon className="h-8 w-8 text-gray-400" />
              </div>
            </div>
            <p className="text-gray-400 mb-2 font-orbitron">No external accounts connected</p>
            <p className="text-gray-500 text-sm font-rajdhani">
              Connect your gaming accounts to enhance your profile
            </p>
          </div>
        )}
      </Card>

      {/* Add New Account */}
      {unconnectedOptions.length > 0 && (
        <Card className="bg-gray-900 border-gray-800 p-6">
          <h2 className="text-xl font-semibold text-white mb-4 flex items-center gap-2 font-orbitron">
            <PlusIcon className="h-5 w-5 text-blue-400" />
            Add External Account
          </h2>
          
          <div className="space-y-3">
            {unconnectedOptions.map((strategy) => {
              const normalizedProvider = normalizeProvider(strategy)
              const Icon = getProviderIcon(normalizedProvider)
              const providerColor = getProviderColor(normalizedProvider)
              const displayName = getProviderDisplayName(normalizedProvider)
              
                            return (
                 <div key={strategy} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                   <div className="flex items-center gap-3">
                     {Icon === 'valorant-logo' ? (
                       <div className="w-10 h-10 flex items-center justify-center">
                         <Image 
                           src="/valorant/logos/Valorant Logo Red Border.jpg"
                           alt="VALORANT Logo"
                           width={32}
                           height={32}
                           className="object-contain"
                         />
                       </div>
                     ) : Icon === 'discord-logo' ? (
                       <div className="w-10 h-10 flex items-center justify-center">
                         <Image 
                           src="/discord/Discord-Symbol-White.svg"
                           alt="Discord Logo"
                           width={32}
                           height={32}
                           className="object-contain"
                         />
                       </div>
                     ) : (
                       <div className={`p-2 rounded ${providerColor}`}>
                         <Icon className="h-5 w-5 text-white" />
                       </div>
                     )}
                    <div>
                      <p className="text-white font-medium font-orbitron">{displayName}</p>
                      <p className="text-gray-400 text-sm font-rajdhani">
                        {normalizedProvider === 'custom_valorant' 
                          ? 'Connect your Riot account to link your Valorant profile'
                          : normalizedProvider === 'discord'
                          ? 'Connect your Discord account to showcase your gaming community'
                          : 'Connect your account to enhance your profile'
                        }
                      </p>
                    </div>
                  </div>
                  
                                       <Button
                     onClick={() => addSSO(strategy)}
                     disabled={isConnecting || !isUserReady}
                     className="bg-blue-600 hover:bg-blue-700 text-white font-orbitron"
                   >
                     {isConnecting ? (
                       <>
                         <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                         Connecting...
                       </>
                     ) : !isUserReady ? (
                       <>
                         <LoaderIcon className="h-4 w-4 mr-2 animate-spin" />
                         Loading...
                       </>
                     ) : (
                       <>
                         <PlusIcon className="h-4 w-4 mr-2" />
                         Connect Account
                       </>
                     )}
                   </Button>
                </div>
              )
            })}
          </div>
          
          {/* Information Box */}
          <div className="mt-6 bg-blue-900/20 border border-blue-600/30 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <ShieldIcon className="h-5 w-5 text-blue-400 mt-0.5" />
              <div>
                <h3 className="text-blue-200 font-medium mb-1 font-orbitron">Secure OAuth Connection</h3>
                <p className="text-blue-300 text-sm font-rajdhani">
                  Your account will be securely connected through the platform&apos;s official OAuth system. 
                  We only access basic profile information and never store your password.
                </p>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Help Section */}
      <Card className="bg-gray-900 border-gray-800 p-6">
        <h2 className="text-xl font-semibold text-white mb-4 font-orbitron">Need Help?</h2>
        <div className="space-y-3 text-gray-300">
          <div>
            <h3 className="font-medium text-white font-orbitron">Why connect external accounts?</h3>
            <p className="text-sm text-gray-400 font-rajdhani">
              Connecting your gaming accounts helps verify your identity and allows coaches 
              to see your actual in-game statistics and achievements.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-white font-orbitron">Is my data secure?</h3>
            <p className="text-sm text-gray-400 font-rajdhani">
              Yes! We use OAuth, which means we never see your passwords. We only access 
              basic profile information that you explicitly approve.
            </p>
          </div>
          <div>
            <h3 className="font-medium text-white font-orbitron">Can I remove connections later?</h3>
            <p className="text-sm text-gray-400 font-rajdhani">
              Absolutely! You can remove any connected account at any time using the 
              &quot;Remove&quot; button above.
            </p>
          </div>
        </div>
      </Card>
    </div>
  )
} 